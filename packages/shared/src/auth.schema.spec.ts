import { describe, expect, it } from '@jest/globals';
import { loginSchema, registerSchema } from './auth.schema';

describe('auth schemas', () => {
  it('accepts a valid login payload', () => {
    expect(
      loginSchema.parse({
        email: 'user@example.com',
        password: 'password123',
      }),
    ).toEqual({
      email: 'user@example.com',
      password: 'password123',
    });
  });

  it('rejects a short password during registration', () => {
    expect(() =>
      registerSchema.parse({
        email: 'user@example.com',
        password: 'short',
        firstName: 'Ava',
      }),
    ).toThrow();
  });
});
