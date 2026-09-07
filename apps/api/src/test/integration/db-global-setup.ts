import 'reflect-metadata';
import '../../env/load-env';
import { DataSource } from 'typeorm';
import { APP_ENTITIES } from '../../db/entities';
import { APP_MIGRATIONS } from '../../db/migrations';
import { BootstrapNamingStrategy } from '../../db/naming-strategy';
import { createAdminClient } from './test-db-admin';
import {
  TEMPLATE_DATABASE_NAME,
  WORKER_DATABASE_PREFIX,
} from './test-db-names';

function databaseConnectionString(baseUrl: string, dbName: string): string {
  const url = new URL(baseUrl);
  url.pathname = `/${dbName}`;
  return url.toString();
}

export default async function globalSetup(): Promise<void> {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) {
    throw new Error('DATABASE_URL is required to run integration tests');
  }

  const admin = createAdminClient(baseUrl);
  await admin.connect();
  try {
    const stale = await admin.query<{ datname: string }>(
      `SELECT datname FROM pg_database
       WHERE datname = $1 OR datname LIKE $2`,
      [TEMPLATE_DATABASE_NAME, `${WORKER_DATABASE_PREFIX}%`],
    );
    for (const { datname } of stale.rows) {
      await admin.query(
        `SELECT pg_terminate_backend(pid) FROM pg_stat_activity
         WHERE datname = $1 AND pid <> pg_backend_pid()`,
        [datname],
      );
      await admin.query(`DROP DATABASE IF EXISTS ${datname}`);
    }
    await admin.query(`CREATE DATABASE ${TEMPLATE_DATABASE_NAME}`);
  } finally {
    await admin.end();
  }

  const template = new DataSource({
    type: 'postgres',
    url: databaseConnectionString(baseUrl, TEMPLATE_DATABASE_NAME),
    entities: APP_ENTITIES,
    migrations: APP_MIGRATIONS,
    namingStrategy: new BootstrapNamingStrategy(),
    synchronize: false,
    migrationsRun: false,
  });
  await template.initialize();
  try {
    await template.runMigrations();
  } finally {
    await template.destroy();
  }
}
