import { Body, Param, Query } from '@nestjs/common';
import type { ZodType } from 'zod';
import { ZodValidationPipe } from './validation.pipe';

export const ZodBody = <Output>(schema: ZodType<Output>) =>
  Body(new ZodValidationPipe(schema));

export const ZodParam = <Output>(schema: ZodType<Output>) =>
  Param(new ZodValidationPipe(schema));

export const ZodQuery = <Output>(schema: ZodType<Output>) =>
  Query(new ZodValidationPipe(schema));
