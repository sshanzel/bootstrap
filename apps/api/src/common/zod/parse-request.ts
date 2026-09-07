import { BadRequestException } from '@nestjs/common';
import type { ZodType } from 'zod';

export function parseRequest<RequestShape>(
  schema: ZodType<RequestShape>,
  value: unknown,
): RequestShape {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new BadRequestException({
      message: 'Validation failed',
      details: result.error.issues.map((issue) => ({
        path: issue.path.map(String).join('.'),
        message: issue.message,
      })),
    });
  }
  return result.data;
}
