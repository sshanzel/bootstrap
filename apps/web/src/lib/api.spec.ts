import axios, {
  type AxiosInstance,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

interface ImportedApiModule {
  api: AxiosInstance;
  getApiUrl: (path: string) => string;
  setupInterceptors: () => void;
}

async function importApiModule(): Promise<ImportedApiModule> {
  vi.resetModules();
  vi.stubEnv('VITE_API_URL', 'http://localhost:4000');
  return import('./api');
}

function createResponse(
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown,
): AxiosResponse {
  return {
    config,
    data,
    headers: {},
    status,
    statusText: status === 200 ? 'OK' : 'Unauthorized',
  };
}

function rejectUnauthorized(
  config: InternalAxiosRequestConfig,
): Promise<never> {
  return Promise.reject({
    config,
    response: createResponse(config, 401, { message: 'Unauthorized' }),
  });
}

async function flushPendingPromises(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

async function waitForAssertion(assertion: () => void): Promise<void> {
  for (let attemptIndex = 0; attemptIndex < 10; attemptIndex += 1) {
    try {
      assertion();
      return;
    } catch (error) {
      if (attemptIndex === 9) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('getApiUrl', () => {
  it('builds the API url from VITE_API_URL', async () => {
    const { getApiUrl } = await importApiModule();
    expect(getApiUrl('/auth/me')).toBe('http://localhost:4000/api/auth/me');
  });
});

describe('api session refresh', () => {
  it('refreshes and retries an expired /auth/me session check', async () => {
    const { api, setupInterceptors } = await importApiModule();
    const refreshRequest = vi
      .spyOn(axios, 'post')
      .mockResolvedValue({ data: { ok: true } });
    let requestCount = 0;
    const adapter: AxiosAdapter = async (config) => {
      requestCount += 1;
      if (requestCount === 1) {
        return rejectUnauthorized(config);
      }

      return createResponse(config, 200, { user: { id: 'user_123' } });
    };

    api.defaults.adapter = adapter;
    setupInterceptors();

    await expect(api.get('/auth/me')).resolves.toMatchObject({
      data: { user: { id: 'user_123' } },
    });

    expect(refreshRequest).toHaveBeenCalledTimes(1);
    expect(refreshRequest).toHaveBeenCalledWith(
      'http://localhost:4000/api/auth/refresh',
      {},
      { withCredentials: true },
    );
    expect(requestCount).toBe(2);
  });

  it('does not refresh login failures', async () => {
    const { api, setupInterceptors } = await importApiModule();
    const refreshRequest = vi
      .spyOn(axios, 'post')
      .mockResolvedValue({ data: { ok: true } });
    const adapter: AxiosAdapter = (config) => rejectUnauthorized(config);

    api.defaults.adapter = adapter;
    setupInterceptors();

    await expect(api.post('/auth/login', {})).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(refreshRequest).not.toHaveBeenCalled();
  });

  it('shares one refresh request across concurrent 401 responses', async () => {
    const { api, setupInterceptors } = await importApiModule();
    let finishRefresh: ((value: AxiosResponse) => void) | undefined;
    const refreshPromise = new Promise<AxiosResponse>((resolve) => {
      finishRefresh = resolve;
    });
    const refreshRequest = vi
      .spyOn(axios, 'post')
      .mockReturnValue(refreshPromise);
    let unauthorizedRequestCount = 0;
    let finishUnauthorizedRequests: (() => void) | undefined;
    const unauthorizedRequests = new Promise<void>((resolve) => {
      finishUnauthorizedRequests = resolve;
    });
    const adapter: AxiosAdapter = async (config) => {
      const retriedConfig = config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };
      if (!retriedConfig._retry) {
        unauthorizedRequestCount += 1;
        if (unauthorizedRequestCount === 2) {
          finishUnauthorizedRequests?.();
        }
        return rejectUnauthorized(config);
      }

      return createResponse(config, 200, { path: config.url });
    };

    api.defaults.adapter = adapter;
    setupInterceptors();

    const meetingsRequest = api.get('/meetings');
    const meetingRequest = api.get('/meetings/meeting_123');
    const combinedRequest = Promise.all([meetingsRequest, meetingRequest]);
    await unauthorizedRequests;
    await flushPendingPromises();

    await waitForAssertion(() =>
      expect(refreshRequest).toHaveBeenCalledTimes(1),
    );
    if (!finishRefresh) {
      throw new Error('Refresh promise was not initialized');
    }
    finishRefresh(
      createResponse(
        {
          headers: {},
          method: 'post',
          url: '/auth/refresh',
        } as InternalAxiosRequestConfig,
        200,
        { ok: true },
      ),
    );

    await expect(combinedRequest).resolves.toEqual([
      expect.objectContaining({ data: { path: '/meetings' } }),
      expect.objectContaining({ data: { path: '/meetings/meeting_123' } }),
    ]);
    expect(refreshRequest).toHaveBeenCalledTimes(1);
  });
});
