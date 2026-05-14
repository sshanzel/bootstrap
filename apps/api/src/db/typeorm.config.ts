import 'reflect-metadata';
import '../env/load-env';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { envSchema } from '../env/env.schema';
import { BootstrapNamingStrategy } from './naming-strategy';

const env = envSchema.parse(process.env);

function getMigrationPaths(): string[] {
  const migrationsDirectory = join(import.meta.dirname, 'migrations');

  return readdirSync(migrationsDirectory)
    .filter((fileName) => {
      return !fileName.endsWith('.spec.ts') && !fileName.endsWith('.spec.js');
    })
    .map((fileName) => join(migrationsDirectory, fileName));
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: env.DATABASE_URL,
  entities: [join(import.meta.dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: getMigrationPaths(),
  namingStrategy: new BootstrapNamingStrategy(),
  synchronize: false,
  migrationsRun: false,
};

export default new DataSource(dataSourceOptions);
