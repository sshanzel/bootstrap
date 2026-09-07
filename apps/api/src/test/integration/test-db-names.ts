import { checkoutScope } from '../../db/checkout-scope';

const CHECKOUT_SCOPE = checkoutScope();

export const TEMPLATE_DATABASE_NAME = `bootstrap_test_${CHECKOUT_SCOPE}_template`;
export const WORKER_DATABASE_PREFIX = `bootstrap_test_${CHECKOUT_SCOPE}_w`;

export function workerDatabaseName(): string {
  const workerId = process.env.JEST_WORKER_ID ?? '1';
  return `${WORKER_DATABASE_PREFIX}${workerId}`;
}
