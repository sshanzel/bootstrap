import '../../env/load-env';
import type { Client } from 'pg';
import type { DataSource } from 'typeorm';
import { createAdminClient } from './test-db-admin';
import { TEMPLATE_DATABASE_NAME, workerDatabaseName } from './test-db-names';

const POSTGRES_SOURCE_IN_USE = '55006';
const CLONE_RETRY_DELAYS_MS = [100, 250, 500, 1000, 2000];

function isSourceInUse(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: string }).code === POSTGRES_SOURCE_IN_USE
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// `CREATE DATABASE ... TEMPLATE` fails with 55006 while another worker is cloning the same template, so retry with backoff.
async function cloneTemplate(admin: Client, dbName: string): Promise<void> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      await admin.query(
        `CREATE DATABASE ${dbName} TEMPLATE ${TEMPLATE_DATABASE_NAME}`,
      );
      return;
    } catch (error) {
      const delay = CLONE_RETRY_DELAYS_MS[attempt];
      if (!isSourceInUse(error) || delay === undefined) {
        throw error;
      }
      await sleep(delay);
    }
  }
}

// Re-cloning per spec file would re-contend on the shared template lock, which manifests as flaky parallel runs.
export async function prepareTestDatabase(): Promise<void> {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) {
    throw new Error('DATABASE_URL is required to run integration tests');
  }

  const dbName = workerDatabaseName();
  const admin = createAdminClient(baseUrl);
  await admin.connect();
  try {
    const existing = await admin.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName],
    );
    if (existing.rowCount === 0) {
      await cloneTemplate(admin, dbName);
    }
  } finally {
    await admin.end();
  }

  const testUrl = new URL(baseUrl);
  testUrl.pathname = `/${dbName}`;
  process.env.DATABASE_URL = testUrl.toString();
}

// TRUNCATE locks every table at once, so a write still finishing from the previous test can deadlock it; the deadlock is transient, so retry.
const TRANSIENT_DB_ERRORS = new Set(['40P01', '40001']);

function transientDbCode(error: unknown): string | null {
  if (typeof error !== 'object' || error === null) {
    return null;
  }
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' && TRANSIENT_DB_ERRORS.has(code)
    ? code
    : null;
}

export async function resetDatabase(dataSource: DataSource): Promise<void> {
  const tableNames = dataSource.entityMetadatas
    .map((metadata) => `"${metadata.tableName}"`)
    .join(', ');
  if (tableNames.length === 0) {
    return;
  }

  const truncate = `TRUNCATE ${tableNames} RESTART IDENTITY CASCADE`;
  for (let attempt = 0; ; attempt += 1) {
    try {
      await dataSource.query(truncate);
      return;
    } catch (error) {
      if (transientDbCode(error) === null || attempt >= 20) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
}
