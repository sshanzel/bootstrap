import { Client } from 'pg';

const ADMIN_CONNECT_TIMEOUT_MS = 10_000;
const ADMIN_STATEMENT_TIMEOUT_MS = 30_000;

/**
 * Connect and statement waits are bounded so a stalled connect or a blocked
 * DROP/CREATE fails fast instead of hanging the whole suite — a wedged Docker
 * Postgres once froze a run indefinitely on a `connect()` that had no timeout.
 */
export function createAdminClient(baseUrl: string): Client {
  const url = new URL(baseUrl);
  url.pathname = '/postgres';
  return new Client({
    connectionString: url.toString(),
    connectionTimeoutMillis: ADMIN_CONNECT_TIMEOUT_MS,
    statement_timeout: ADMIN_STATEMENT_TIMEOUT_MS,
  });
}
