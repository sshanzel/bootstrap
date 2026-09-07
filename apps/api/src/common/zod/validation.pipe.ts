import { Injectable, type PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';
import { parseRequest } from './parse-request';

@Injectable()
export class ZodValidationPipe<Output> implements PipeTransform<
  unknown,
  Output
> {
  constructor(private readonly schema: ZodType<Output>) {}

  transform(value: unknown): Output {
    return parseRequest(this.schema, value);
  }
}
