import axios from 'axios';
import { getConfig } from './config';

const configuredUrl = getConfig('VITE_API_URL');
const apiBaseUrl = configuredUrl
  ? `${configuredUrl.replace(/\/+$/, '')}/api`
  : '/api';

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
        | { _retry?: boolean; url?: string }
        | undefined;
      if (!originalRequest) {
        return Promise.reject(error);
      }

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/')
      ) {
        originalRequest._retry = true;
        try {
          await axios.post(
            getApiUrl('/auth/refresh'),
            {},
            { withCredentials: true },
          );
          return api(originalRequest);
        } catch {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }

      return Promise.reject(error);
    },
  );
}
