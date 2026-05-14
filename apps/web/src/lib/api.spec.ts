import { describe, expect, it, vi } from 'vitest';

vi.stubEnv('VITE_API_URL', 'http://localhost:4000');

describe('getApiUrl', () => {
  it('builds the API url from VITE_API_URL', async () => {
    const { getApiUrl } = await import('./api');
    expect(getApiUrl('/auth/me')).toBe('http://localhost:4000/api/auth/me');
  });
});
