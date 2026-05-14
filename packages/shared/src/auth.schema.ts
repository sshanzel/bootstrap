import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(72),
});

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(72),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100).optional(),
});

export const authUserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  authProvider: z.enum(['local', 'google']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const authResponseSchema = z.object({
  user: authUserSchema,
});

export const meResponseSchema = z.object({
  user: authUserSchema,
});

export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;
