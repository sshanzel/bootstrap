import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const apiEnvPath = 'apps/api/.env';
const databaseName = 'bootstrap';
const maxReadinessAttempts = 30;
const readinessDelayMs = 1_000;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function sleep(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function waitForPostgres() {
  for (let attempt = 1; attempt <= maxReadinessAttempts; attempt += 1) {
    const result = spawnSync(
      'docker',
      [
        'compose',
        'exec',
        '-T',
        'postgres',
        'pg_isready',
        '-U',
        'postgres',
        '-d',
        databaseName,
      ],
      { stdio: 'ignore' },
    );

    if (result.status === 0) {
      return;
    }

    sleep(readinessDelayMs);
  }

  console.error('Postgres did not become ready in time.');
  process.exit(1);
}

if (!existsSync(apiEnvPath)) {
  console.error(
    `Missing ${apiEnvPath}. Copy apps/api/.env.example before resetting the database.`,
  );
  process.exit(1);
}

console.log('Resetting local Postgres volume...');
run('docker', ['compose', 'down', '--volumes', '--remove-orphans']);

console.log('Starting Postgres...');
run('docker', ['compose', 'up', '-d', 'postgres']);

console.log('Waiting for Postgres...');
waitForPostgres();

console.log('Running migrations...');
run('pnpm', ['--filter', '@bootstrap/api', 'migration:run']);

console.log('Database reset complete.');
