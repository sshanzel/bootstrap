import { createHash } from 'node:crypto';

// Concurrent checkouts share one local Postgres, and fixed test-database
// names let one session's setup/teardown recreate them underneath another's
// live run — state vanishes mid-test. cwd is stable within a run and
// distinct per checkout.
export function checkoutScope(): string {
  return createHash('sha256').update(process.cwd()).digest('hex').slice(0, 8);
}
