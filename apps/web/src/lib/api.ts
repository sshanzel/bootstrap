import axios, { type InternalAxiosRequestConfig } from 'axios';
import { getConfig } from './config';

const configuredUrl = getConfig('VITE_API_URL');
const apiBaseUrl = configuredUrl
  ? `${configuredUrl.replace(/\/+$/, '')}/api`
  : '/api';
const SESSION_REFRESH_EXCLUDED_PATHS = new Set([
  '/auth/google/callback',
  '/auth/google/start',
  '/auth/login',
  '/auth/logout',
  '/auth/refresh',
  '/auth/register',
]);

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshSessionPromise: Promise<void> | null = null;

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

export function setupInterceptors(): void {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as
        | RetriableRequestConfig
        | undefined;
      if (!originalRequest) {
        return Promise.reject(error);
      }

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !shouldSkipSessionRefresh(originalRequest.url)
      ) {
        originalRequest._retry = true;
        try {
          await refreshSession();
          return api(originalRequest);
        } catch {
          if (
            typeof window !== 'undefined' &&
            window.location.pathname !== '/login'
          ) {
            window.location.href = '/login';
          }
        }
      }

      return Promise.reject(error);
    },
  );
}

function shouldSkipSessionRefresh(url: string | undefined): boolean {
  const requestPath = getRequestPath(url);
  if (!requestPath) {
    return false;
  }

  return SESSION_REFRESH_EXCLUDED_PATHS.has(stripApiPrefix(requestPath));
}

function getRequestPath(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }

  try {
    return new URL(url, 'http://bootstrap.local').pathname;
  } catch {
    return url.split('?')[0];
  }
}

function stripApiPrefix(path: string): string {
  return path.startsWith('/api/') ? path.slice('/api'.length) : path;
}

function refreshSession(): Promise<void> {
  if (!refreshSessionPromise) {
    refreshSessionPromise = axios
      .post(getApiUrl('/auth/refresh'), {}, { withCredentials: true })
      .then(() => undefined)
      .finally(() => {
        refreshSessionPromise = null;
      });
  }

  return refreshSessionPromise;
}
