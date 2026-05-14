import { spawnSync } from 'node:child_process';
import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { extname, join, relative } from 'node:path';

const ignoredDirectories = new Set([
  '.git',
  'coverage',
  'dist',
  'node_modules',
]);
const textFileNames = new Set([
  '.env',
  '.env.example',
  '.gitignore',
  '.node-version',
  '.nvmrc',
  '.prettierignore',
  'Tiltfile',
]);
const textFileExtensions = new Set([
  '.css',
  '.html',
  '.json',
  '.md',
  '.mjs',
  '.ts',
  '.tsx',
  '.yml',
  '.yaml',
]);

function parseArgs(argv) {
  const options = { resetGit: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--') {
      continue;
    }

    if (arg === '--reset-git') {
      options.resetGit = true;
      continue;
    }

    if (!arg.startsWith('--')) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    const key = arg.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${arg}`);
    }

    options[key] = value;
    index += 1;
  }

  return options;
}

function toSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toPascalCase(value) {
  return value
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join('');
}

function toDatabaseName(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function validateIdentifier(name, value) {
  if (!value) {
    throw new Error(`${name} cannot be empty.`);
  }
}

function collectTextFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);

    const stats = statSync(path);
    if (stats.isDirectory()) {
      if (!ignoredDirectories.has(entry)) {
        files.push(...collectTextFiles(path));
      }
      continue;
    }

    if (textFileNames.has(entry) || textFileExtensions.has(extname(entry))) {
      files.push(path);
    }
  }

  return files;
}

function replaceAll(content, replacements) {
  let nextContent = content;
  for (const [from, to] of replacements) {
    nextContent = nextContent.replaceAll(from, to);
  }

  return nextContent;
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed.`);
  }
}

try {
  const options = parseArgs(process.argv.slice(2));
  if (!options.name) {
    console.error(
      'Usage: pnpm init:project -- --name "My App" [--slug my-app] [--scope my-app] [--db-name my_app] [--reset-git]',
    );
    process.exit(1);
  }

  const appName = options.name.trim();
  const slug = options.slug ? toSlug(options.slug) : toSlug(appName);
  const packageScope = options.scope ? toSlug(options.scope) : slug;
  const databaseName = options['db-name']
    ? toDatabaseName(options['db-name'])
    : toDatabaseName(appName);
  const pascalName = toPascalCase(appName);

  validateIdentifier('App name', appName);
  validateIdentifier('Slug', slug);
  validateIdentifier('Package scope', packageScope);
  validateIdentifier('Database name', databaseName);
  validateIdentifier('Pascal-case app name', pascalName);

  const replacements = [
    ['BootstrapNamingStrategy', `${pascalName}NamingStrategy`],
    ['Bootstrap', appName],
    ['@bootstrap', `@${packageScope}`],
    ['bootstrap-theme', `${slug}-theme`],
    ['bootstrap.example', `${slug}.example`],
    ['POSTGRES_DB: bootstrap', `POSTGRES_DB: ${databaseName}`],
    [
      'DATABASE_URL=postgresql://postgres:postgres@localhost:5434/bootstrap',
      `DATABASE_URL=postgresql://postgres:postgres@localhost:5434/${databaseName}`,
    ],
    [
      'postgresql://postgres:postgres@localhost:5434/bootstrap',
      `postgresql://postgres:postgres@localhost:5434/${databaseName}`,
    ],
    [
      'pg_isready -U postgres -d bootstrap',
      `pg_isready -U postgres -d ${databaseName}`,
    ],
    [
      "const databaseName = 'bootstrap';",
      `const databaseName = '${databaseName}';`,
    ],
    ['"name": "bootstrap"', `"name": "${slug}"`],
    ['bootstrap', slug],
  ];

  let changedFiles = 0;
  for (const file of collectTextFiles(process.cwd())) {
    const content = readFileSync(file, 'utf8');
    const nextContent = replaceAll(content, replacements);
    if (nextContent === content) {
      continue;
    }

    writeFileSync(file, nextContent);
    changedFiles += 1;
  }

  if (options.resetGit) {
    if (existsSync('.git')) {
      rmSync('.git', { recursive: true, force: true });
    }
    run('git', ['init']);
  }

  run('pnpm', ['install', '--lockfile-only']);

  console.log(`Initialized ${appName}. Updated ${changedFiles} files.`);
  if (options.resetGit) {
    console.log('Reinitialized git repository.');
  }
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error.';
  console.error(message);
  process.exit(1);
}
