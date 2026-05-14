import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';

const envFiles = [
  ['apps/api/.env.example', 'apps/api/.env'],
  ['apps/web/.env.example', 'apps/web/.env'],
];

const databaseName = 'bootstrap';
const postgresWaitAttempts = 60;
const postgresWaitDelayMs = 1_000;
const staleEnvReplacements = [
  [
    'DATABASE_URL=postgresql://postgres:postgres@localhost:5433/zento',
    'DATABASE_URL=postgresql://postgres:postgres@localhost:5434/bootstrap',
  ],
  [
    'DATABASE_URL=postgresql://postgres:postgres@localhost:5433/bootstrap',
    'DATABASE_URL=postgresql://postgres:postgres@localhost:5434/bootstrap',
  ],
];

function sleep(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function runCommand(command, args) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function formatCommand(command, args) {
  return [command, ...args].join(' ');
}

function commandSummary(result) {
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
  if (output.length === 0) {
    return 'No output.';
  }

  return output.split('\n')[0];
}

function parseMajorVersion(version) {
  const match = version.match(/v?(\d+)/);
  if (!match) {
    return null;
  }

  return Number.parseInt(match[1], 10);
}

function assertCommand(requirement, failures) {
  const result = runCommand(requirement.command, requirement.args);
  if (result.error) {
    failures.push(
      `${requirement.name} is not available. Install it and ensure \`${requirement.command}\` is on PATH.`,
    );
    return;
  }

  if (result.status !== 0) {
    failures.push(
      `${formatCommand(requirement.command, requirement.args)} failed: ${commandSummary(result)}`,
    );
    return;
  }

  if (requirement.minimumMajorVersion === undefined) {
    return;
  }

  const majorVersion = parseMajorVersion(result.stdout.trim());
  if (majorVersion === null || majorVersion < requirement.minimumMajorVersion) {
    failures.push(
      `${requirement.name} must be version ${requirement.minimumMajorVersion}+; found ${commandSummary(result)}.`,
    );
  }
}

function checkTools() {
  const failures = [];
  const nodeMajorVersion = parseMajorVersion(process.version);

  if (nodeMajorVersion === null || nodeMajorVersion < 22) {
    failures.push(`Node.js must be version 22+; found ${process.version}.`);
  }

  const requirements = [
    {
      name: 'Tilt',
      command: 'tilt',
      args: ['version'],
    },
    {
      name: 'Docker',
      command: 'docker',
      args: ['--version'],
    },
    {
      name: 'Docker Compose',
      command: 'docker',
      args: ['compose', 'version'],
    },
    {
      name: 'pnpm',
      command: 'pnpm',
      args: ['--version'],
      minimumMajorVersion: 10,
    },
  ];

  for (const requirement of requirements) {
    assertCommand(requirement, failures);
  }

  if (failures.length > 0) {
    console.error('Local dev environment is missing required tools:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('Local dev tools are ready.');
}

function syncEnv() {
  for (const [examplePath, targetPath] of envFiles) {
    if (!existsSync(examplePath)) {
      console.error(`Missing ${examplePath}.`);
      process.exit(1);
    }

    if (existsSync(targetPath)) {
      patchStaleEnv(targetPath);
      console.log(`Keeping existing ${targetPath}.`);
      continue;
    }

    copyFileSync(examplePath, targetPath);
    console.log(`Created ${targetPath} from ${examplePath}.`);
  }
}

function patchStaleEnv(targetPath) {
  let content = readFileSync(targetPath, 'utf8');
  let patched = false;

  for (const [staleValue, nextValue] of staleEnvReplacements) {
    if (!content.includes(staleValue)) {
      continue;
    }

    content = content.replaceAll(staleValue, nextValue);
    patched = true;
  }

  if (patched) {
    writeFileSync(targetPath, content);
    console.log(`Updated stale Bootstrap defaults in ${targetPath}.`);
  }
}

function waitForPostgres() {
  for (let attempt = 1; attempt <= postgresWaitAttempts; attempt += 1) {
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
      console.log('Postgres is ready.');
      return;
    }

    sleep(postgresWaitDelayMs);
  }

  console.error('Postgres did not become ready in time.');
  process.exit(1);
}

const command = process.argv[2];

if (command === 'check-tools') {
  checkTools();
} else if (command === 'sync-env') {
  syncEnv();
} else if (command === 'wait-postgres') {
  waitForPostgres();
} else {
  console.error(
    'Usage: node scripts/dev-env.mjs <check-tools|sync-env|wait-postgres>',
  );
  process.exit(1);
}
