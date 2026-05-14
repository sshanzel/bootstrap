# Bootstrap Monorepo

pnpm-managed monorepo for the Bootstrap platform.

## Structure

- `apps/api/` — NestJS backend (PostgreSQL + TypeORM)
- `apps/web/` — Vite + React SPA (TanStack Router + Query)
- `packages/shared/` — Shared Zod schemas and TypeScript types (`@bootstrap/shared`)

## Tech Stack

- **Runtime**: Node 22
- **Language**: TypeScript (ESM)
- **API**: NestJS + TypeORM + PostgreSQL
- **Web**: Vite + React + TanStack Router + TanStack Query
- **Validation**: Zod v4
- **Monorepo**: pnpm workspaces
- **CI**: GitHub Actions

## Key Commands

```bash
pnpm --filter @bootstrap/api dev
pnpm --filter @bootstrap/web dev
pnpm --filter @bootstrap/api test
pnpm --filter @bootstrap/web test
pnpm --filter @bootstrap/shared test
pnpm format
pnpm dev
pnpm init:project -- --name "My App"
```

## Creating a New Project From This Starter

Run the initializer immediately after copying the starter into a new folder:

```bash
pnpm init:project -- --name "My App"
```

The initializer updates package names/scopes, TypeScript path aliases, imports, docs, UI/API titles, local database defaults, GitHub workflow package filters and test database names, Docker/Tilt config, and the pnpm lockfile. It derives a slug, package scope, and database name from the app name unless explicit `--slug`, `--scope`, or `--db-name` values are provided.

Use `--reset-git` only inside a copied project folder when the copied git history should be removed and replaced with a fresh `git init`.

After initialization, update project-specific secrets and external service settings:

- `apps/api/.env` and `apps/web/.env`
- Google OAuth client settings and callback URLs
- README product description and starter UI copy
- local Postgres port if another project already uses `5434`
- git remote, CI secrets, and deployment settings

When adding or renaming GitHub workflow jobs, keep `scripts/initialize-project.mjs` replacements in sync so copied projects do not inherit `@bootstrap` package filters or `bootstrap_test` database names. If a workflow value cannot be safely derived by the initializer, document the required manual update in this section.

## Local Development

- Start PostgreSQL with `docker compose up -d`
- Copy `apps/api/.env.example` to `apps/api/.env`
- Copy `apps/web/.env.example` to `apps/web/.env`
- Run DB migrations before starting the API
- Or run `pnpm dev` to let Tilt orchestrate setup, Postgres, migrations, API, and web

## Core Principles

- **Program defensively** — assume outside input can be malformed, missing, or inconsistent, and validate it where it enters the system.
- **Protect the small foundation** — avoid adding providers, infrastructure, env surface area, or extra abstraction before the product actually needs them.
- **Keep one auth/session path** — password and Google sign-in should converge on the exact same cookie-backed session behavior.
- **Centralize shared contracts** — if both the API and web depend on it, it should live in `packages/shared`.
- **Use simple frontend config** — this repo relies on Vite build-time envs through `import.meta.env`; do not bring back runtime config indirection without a concrete deployment need.

## Code Style

These rules are mandatory.

- **No single-letter variables** except loop counters (`i`, `j`, `k`) and sort comparators (`a`, `b`).
- **No nested ternaries** — use `if`/`else`, early returns, or extracted render helpers.
- **Extract complex conditionals into named helpers** when the intent is not obvious inline.
- **All imports at the top** of the file.
- **No inline type literals** in public signatures — define a named `type` or `interface`.
- **Use `type` imports** for type-only imports.
- **Use typed unions for known values** — avoid raw `string` when values come from a fixed set.
- **Strict equality only** — always `===` and `!==`.
- **`const` over `let`** unless reassignment is required.
- **Object shorthand** — `{ id }`, not `{ id: id }`.
- **No stray `console.log`** — use structured logging or explicit temporary debugging that is removed before merge. `main.ts` boot messages may use guarded `console.log`.
- **Do not interpolate unknown errors directly** — normalize errors before logging or returning messages.
- **Never leak stack traces to users** — user-facing messages should use safe summaries, not raw server errors.

## Conventions

- **ESM only** — keep `"type": "module"` and modern TS/ESM imports.
- **No unnecessary comments** — prefer clear names and small functions.
- **Zod for validation** — schemas live in `packages/shared/src/`.
- **Shared types** come from `@bootstrap/shared`.
- **Const arrays over enums** — prefer `as const` arrays plus `z.enum()`.
- **Dependencies live where they are used** — root dependencies are only for truly shared tooling.
- **Scoped config changes** — do not change one app's tooling config unless that app needs it.
- **Incremental development** — add env vars, modules, entities, and infra only when the feature exists.
- **Keep auth flows consistent** — cookie semantics, redirect handling, and refresh behavior should stay aligned across providers.
- **Prefer explicit filenames** — e.g. `auth.service.ts`, `google-oauth.service.ts`, `cookie.service.ts`.
- **Single-column uniqueness belongs on the column** via `@Column({ unique: true })`.
- **Service decomposition over large workflow classes** — orchestration can call smaller helpers or services.
- **Transactions are not a reason to keep logic monolithic** — pass transactional context when needed.
- **Generic over speculative** — do not design for hypothetical future domains until the product needs them.
- **Extract shared utilities instead of duplicating** — two usages is a signal, three is a requirement.
- **Conventional commits** — `<type>(<optional scope>): <short imperative summary>`.

## Architecture Patterns

### Separate Concerns Clearly

If two operations solve different problems, keep them as separate steps even when they execute one after another.

### Normalize At The Edge

Convert provider payloads, query params, cookies, and third-party responses into internal shapes as soon as they cross the boundary.

### Share Contracts Deliberately

Schemas for requests, responses, users, and sessions belong in `packages/shared` so both apps consume the same source of truth.

### Keep Transport Layers Thin

Controllers and other boundary-facing files should parse, validate, and hand off. They should not become the place where business workflows accumulate.

### Start Narrow

The repo is intentionally lean right now. Favor the smallest implementation that fully supports the current platform and auth requirements.

## Common Pitfalls

- **Truthiness checks hiding valid values** — do not accidentally discard `''` or `0` when those values are meaningful.
- **Dropped async failures** — either `await` the promise or attach a `.catch()`.
- **Missing cleanup** — timers, clients, and listeners need explicit teardown behavior.
- **Coercive global helpers** — prefer `Number.isFinite`, `Number.isNaN`, and `Number.parseInt`.
- **Loading too much data** — fetch the minimum data needed for the active path.
- **Tests that end too early** — if code writes to the DB or returns a structured result, verify the final outcome, not only the mock interaction.
- **Missing the API prefix in callbacks** — external callback URLs must include `/api/...` because the Nest app serves everything under that prefix.

## Bug Fixes

- **Every bug fix must include a test** that reproduces and verifies the fix.
- **Tests must cover edge cases** when they change the behavior meaningfully.
- **Utility functions need rigorous edge-case coverage** because many callers inherit their bugs.
- **Use literal expectations in tests** for URLs, paths, and protocol-level values rather than reusing the production constant under test.

## Quality Checks

Always run the repo scripts before pushing:

```bash
pnpm --filter @bootstrap/api typecheck
pnpm --filter @bootstrap/web typecheck
pnpm --filter @bootstrap/shared typecheck
pnpm --filter @bootstrap/api lint:ci
pnpm --filter @bootstrap/web lint:ci
pnpm --filter @bootstrap/api test
pnpm --filter @bootstrap/web test
pnpm --filter @bootstrap/shared test
pnpm --filter @bootstrap/web build
pnpm format:check
```

If `format:check` fails, run `pnpm format`.

## Module Documentation

Modules and complex subsystems should have an `AGENTS.md` in their directory once they become large enough that an engineer would otherwise need to read many files to recover context.

### Use existing documentation first

Before reading a large module, check whether an `AGENTS.md` already exists there.

### Fill Documentation Gaps

If understanding a module required broad code reading, add module-level documentation while that context is still fresh.

### Keep documentation current

Update a module `AGENTS.md` whenever you change:

- architecture or data flow
- status lifecycles
- key files
- invariants
- common change patterns
