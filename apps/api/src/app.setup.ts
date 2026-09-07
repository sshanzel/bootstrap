import type { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ApiExceptionFilter } from './common/api-exception.filter';
import { requestIdMiddleware } from './common/request-id.middleware';
import { EnvService } from './env/env.service';

export function configureApp(app: INestApplication): void {
  const env = app.get(EnvService);

  app.setGlobalPrefix('api');
  app.use(requestIdMiddleware);
  app.use(cookieParser());
  app.enableCors({
    origin: env.getAllowedOrigins(),
    credentials: true,
  });
  app.useGlobalFilters(new ApiExceptionFilter());
}
