import 'reflect-metadata';
import './env/load-env';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { EnvService } from './env/env.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const env = app.get(EnvService);

  configureApp(app);
  // node runs as PID 1 in the deployed image, and the kernel delivers no
  // default-disposition signals to PID 1 — without this hook a docker stop
  // burns the whole grace period into a SIGKILL.
  app.enableShutdownHooks();

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

bootstrap().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
