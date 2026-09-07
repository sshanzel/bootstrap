import '../../env/load-env';
import { createAdminClient } from './test-db-admin';
import {
  TEMPLATE_DATABASE_NAME,
  WORKER_DATABASE_PREFIX,
} from './test-db-names';

export default async function globalTeardown(): Promise<void> {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) {
    return;
  }

  const admin = createAdminClient(baseUrl);
  await admin.connect();
  try {
    const disposable = await admin.query<{ datname: string }>(
      `SELECT datname FROM pg_database
       WHERE datname = $1 OR datname LIKE $2`,
      [TEMPLATE_DATABASE_NAME, `${WORKER_DATABASE_PREFIX}%`],
    );
    for (const { datname } of disposable.rows) {
      await admin.query(
        `SELECT pg_terminate_backend(pid) FROM pg_stat_activity
         WHERE datname = $1 AND pid <> pg_backend_pid()`,
        [datname],
      );
      await admin.query(`DROP DATABASE IF EXISTS ${datname}`);
    }
  } finally {
    await admin.end();
  }
}
