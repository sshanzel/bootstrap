import 'reflect-metadata';
import './env/load-env';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { EnvService } from './env/env.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const env = app.get(EnvService);

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({
    origin: env.getAllowedOrigins(),
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Bootstrap API')
    .setVersion('1.0')
    .addCookieAuth('accessToken')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(env.get('PORT'));

  if (!env.isProduction) {
    console.log(`API running on http://localhost:${env.get('PORT')}`);
  }
}

bootstrap();
