import { describe, expect, it } from '@jest/globals';
import { envSchema } from './env.schema';

describe('envSchema', () => {
  it('parses the required auth-focused environment variables', () => {
    expect(
      envSchema.parse({
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5434/bootstrap',
        JWT_SECRET: 'secret',
        COOKIE_DOMAIN: 'localhost',
        FRONTEND_URL: 'http://localhost:3000',
        API_BASE_URL: 'http://localhost:4000',
        ALLOWED_ORIGINS: 'http://localhost:3000',
        GOOGLE_CLIENT_ID: 'google-client',
        GOOGLE_CLIENT_SECRET: 'google-secret',
      }),
    ).toMatchObject({
      PORT: 4000,
      NODE_ENV: 'development',
    });
  });

  it('allows host-only cookies when cookie domain is omitted', () => {
    const parsed = envSchema.parse({
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5434/bootstrap',
      JWT_SECRET: 'secret',
      FRONTEND_URL: 'http://localhost:3000',
      API_BASE_URL: 'http://localhost:4000',
      ALLOWED_ORIGINS: 'http://localhost:3000',
      GOOGLE_CLIENT_ID: 'google-client',
      GOOGLE_CLIENT_SECRET: 'google-secret',
    });

    expect(parsed).toMatchObject({ NODE_ENV: 'development' });
    expect(parsed.COOKIE_DOMAIN).toBeUndefined();
  });

  it('allows host-only cookies when cookie domain is blank', () => {
    const parsed = envSchema.parse({
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5434/bootstrap',
      JWT_SECRET: 'secret',
      COOKIE_DOMAIN: '',
      FRONTEND_URL: 'http://localhost:3000',
      API_BASE_URL: 'http://localhost:4000',
      ALLOWED_ORIGINS: 'http://localhost:3000',
      GOOGLE_CLIENT_ID: 'google-client',
      GOOGLE_CLIENT_SECRET: 'google-secret',
    });

    expect(parsed).toMatchObject({ NODE_ENV: 'development' });
    expect(parsed.COOKIE_DOMAIN).toBeUndefined();
  });

  it('rejects an invalid frontend URL', () => {
    expect(() =>
      envSchema.parse({
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5434/bootstrap',
        JWT_SECRET: 'secret',
        COOKIE_DOMAIN: 'localhost',
        FRONTEND_URL: 'not-a-url',
        API_BASE_URL: 'http://localhost:4000',
        ALLOWED_ORIGINS: 'http://localhost:3000',
        GOOGLE_CLIENT_ID: 'google-client',
        GOOGLE_CLIENT_SECRET: 'google-secret',
      }),
    ).toThrow();
  });
});
