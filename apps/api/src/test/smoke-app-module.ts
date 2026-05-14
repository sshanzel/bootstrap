import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';

async function smokeAppModule(): Promise<void> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  await moduleRef.close();
}

await smokeAppModule();
