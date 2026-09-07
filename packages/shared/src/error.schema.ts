import { z } from 'zod';

export const apiErrorDetailSchema = z.object({
  path: z.string(),
  message: z.string(),
});

export const apiErrorSchema = z.object({
  statusCode: z.number().int(),
  error: z.string(),
  message: z.string(),
  requestId: z.string().optional(),
  details: z.array(apiErrorDetailSchema).optional(),
});

export type ApiErrorDetail = z.infer<typeof apiErrorDetailSchema>;
export type ApiErrorBody = z.infer<typeof apiErrorSchema>;
