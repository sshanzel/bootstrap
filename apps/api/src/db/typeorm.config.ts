import 'reflect-metadata';
import '../env/load-env';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { envSchema } from '../env/env.schema';
import { APP_ENTITIES } from './entities';
import { APP_MIGRATIONS } from './migrations';
import { BootstrapNamingStrategy } from './naming-strategy';

const env = envSchema.parse(process.env);

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: env.DATABASE_URL,
  entities: APP_ENTITIES,
  migrations: APP_MIGRATIONS,
  namingStrategy: new BootstrapNamingStrategy(),
  synchronize: false,
  migrationsRun: false,
};

export default new DataSource(dataSourceOptions);
