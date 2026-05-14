config.define_string_list('to-run', args=True)
cfg = config.parse()

setup_resources = [
  'check-tools',
  'sync-env',
  'pnpm-install',
]
core_resources = setup_resources + [
  'postgres',
  'postgres-ready',
  'api-migrations',
  'api',
]
web_resources = core_resources + [
  'web',
]

resource_groups = {
  'setup': setup_resources,
  'core': core_resources,
  'web': web_resources,
  'all': [],
}

selected_resources = []
run_everything = False
for requested_resource in cfg.get('to-run', []):
  if requested_resource == 'all':
    run_everything = True
    break

  if requested_resource in resource_groups:
    selected_resources += resource_groups[requested_resource]
  else:
    selected_resources.append(requested_resource)

if not run_everything and selected_resources:
  deduped_resources = []
  for selected_resource in selected_resources:
    if selected_resource not in deduped_resources:
      deduped_resources.append(selected_resource)
  config.set_enabled_resources(deduped_resources)

docker_compose('./docker-compose.yml')

dc_resource(
  'postgres',
  labels=['database'],
)

local_resource(
  'check-tools',
  cmd='node scripts/dev-env.mjs check-tools',
  deps=[
    '.node-version',
    '.nvmrc',
    'package.json',
    'scripts/dev-env.mjs',
  ],
  labels=['setup'],
)

local_resource(
  'sync-env',
  cmd='node scripts/dev-env.mjs sync-env',
  deps=[
    'apps/api/.env.example',
    'apps/web/.env.example',
    'scripts/dev-env.mjs',
  ],
  resource_deps=['check-tools'],
  labels=['setup'],
)

local_resource(
  'pnpm-install',
  cmd='pnpm install --frozen-lockfile',
  deps=[
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    'apps/api/package.json',
    'apps/web/package.json',
    'packages/shared/package.json',
  ],
  resource_deps=['check-tools'],
  labels=['setup'],
)

local_resource(
  'postgres-ready',
  cmd='node scripts/dev-env.mjs wait-postgres',
  deps=[
    'docker-compose.yml',
    'scripts/dev-env.mjs',
  ],
  resource_deps=['postgres'],
  labels=['database'],
)

local_resource(
  'api-migrations',
  cmd='pnpm --filter @bootstrap/api migration:run',
  deps=[
    'apps/api/src/db/migrations',
    'apps/api/src/db/typeorm.config.ts',
    'packages/shared/src',
  ],
  resource_deps=[
    'sync-env',
    'pnpm-install',
    'postgres-ready',
  ],
  labels=['api'],
)

local_resource(
  'api',
  cmd='',
  serve_cmd='pnpm --filter @bootstrap/api dev',
  resource_deps=[
    'api-migrations',
  ],
  readiness_probe=probe(
    period_secs=5,
    tcp_socket=tcp_socket_action(port=4000),
  ),
  links=[
    link('http://localhost:4000/api/docs', 'API docs'),
  ],
  labels=['api'],
)

local_resource(
  'web',
  cmd='',
  serve_cmd='pnpm --filter @bootstrap/web dev -- --host 0.0.0.0',
  resource_deps=[
    'sync-env',
    'pnpm-install',
    'api',
  ],
  readiness_probe=probe(
    period_secs=5,
    tcp_socket=tcp_socket_action(port=3000),
  ),
  links=[
    link('http://localhost:3000', 'Web app'),
  ],
  labels=['web'],
)
