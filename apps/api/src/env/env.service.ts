import { Injectable } from '@nestjs/common';
import { type Env, envSchema } from './env.schema';

@Injectable()
export class EnvService {
  private readonly env: Env;

  constructor() {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      const formatted = result.error.issues
        .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
        .join('\n');
      throw new Error(`Invalid environment variables:\n${formatted}`);
    }
    this.env = result.data;
  }

  get<K extends keyof Env>(key: K): Env[K] {
    return this.env[key];
  }

  getAllowedOrigins(): string[] {
    return this.env.ALLOWED_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);
  }

  get isProduction(): boolean {
    return this.env.NODE_ENV === 'production';
  }
}
