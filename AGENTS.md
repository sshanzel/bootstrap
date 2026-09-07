# Bootstrap Monorepo

pnpm-managed monorepo for the Bootstrap platform.

## Working Style

- **Plan before implementing** — outline the approach for non-trivial changes and confirm it before writing code.
- **Follow the stated requirements exactly** — ask when they are ambiguous instead of guessing.
- **Admit uncertainty** — say so when there may be no correct answer or when you do not know.
- **Keep prose concise** — let the code carry the detail.

## Structure

- `apps/api/` — NestJS backend (PostgreSQL + TypeORM)
- `apps/web/` — Vite + React SPA (TanStack Router + Query)
- `packages/shared/` — Shared Zod contracts (`*.schema.ts`) and runtime helpers (`@bootstrap/shared`)

## Tech Stack

- **Runtime**: Node 24
- **Language**: TypeScript (ESM)
- **API**: NestJS + TypeORM + PostgreSQL 17
- **Web**: Vite + React 19 + TanStack Router + TanStack Query + Tailwind CSS 4
- **Validation**: Zod v4
- **Testing**: Jest (api, shared), Vitest (web)
- **Monorepo**: pnpm workspaces
- **CI**: GitHub Actions

## Key Commands

```bash
pnpm dev                          # Tilt: Postgres, migrations, API, web
pnpm db:up                        # start local Postgres only
pnpm db:migrate                   # run API migrations
pnpm db:reset                     # reset local database
pnpm --filter @bootstrap/api dev
pnpm --filter @bootstrap/web dev
pnpm --filter @bootstrap/api test
pnpm --filter @bootstrap/web test
pnpm --filter @bootstrap/shared test
pnpm format
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

- Start PostgreSQL with `pnpm db:up` (Docker, local port `5434`)
- Copy `apps/api/.env.example` to `apps/api/.env`
- Copy `apps/web/.env.example` to `apps/web/.env`
- Run DB migrations (`pnpm db:migrate`) before starting the API
- Or run `pnpm dev` to let Tilt orchestrate setup, Postgres, migrations, API, and web

## Core Principles

- **Program defensively** — assume outside input can be malformed, missing, or inconsistent, and validate it where it enters the system.
- **Stored data is untrusted on read-back** — a persisted row is as suspect as outside input: a hand-written seed, a rotated key, or a hand-edited config can be unreadable or malformed. Decode and validate it where it re-enters the system, and degrade to a controlled, specific error (or an empty view when absence is a normal state), never a blanket 500.
- **Protect the small foundation** — avoid adding providers, infrastructure, env surface area, or extra abstraction before the product actually needs them.
- **Keep one auth/session path** — password and Google sign-in should converge on the exact same cookie-backed session behavior.
- **Centralize shared contracts** — if both the API and web depend on it, it should live in `packages/shared`.
- **Use simple frontend config** — this repo relies on Vite build-time envs through `import.meta.env`; do not bring back runtime config indirection without a concrete deployment need.
- **Match UI density to the product surface** — dashboard, settings, and other operational web surfaces should use compact controls and existing primitives instead of oversized, marketing-style elements.
- **Pre-MVP has no backwards-compatibility contract** — until launch, do not add compatibility shims, shadow fields, or data backfills for renamed fields, old persisted JSON, or staging/local data unless explicitly requested. Prefer the clean canonical contract and reset or clear local data when needed.

## Code Style

These rules are mandatory.

- **No single-letter variables** except loop counters (`i`, `j`, `k`) and sort comparators (`a`, `b`).
- **Comments only when truly necessary** — the default is zero comments. Write one only when it captures a constraint, an invariant, or a non-obvious "why" the code itself cannot express; never to narrate code, restate a name, or label a section. **No receipts:** do not cite the plan, review round, PR, or date that produced the code — that is bookkeeping, not a reason. Keep it to one line. Prefer clear names and small functions, and if a rename or extraction removes the need, do that instead.
- **A quirk or consideration is a test case, not a comment** — when tempted to explain a gotcha ("shaped this way because the obvious version breaks like X", "must run last because…"), write the fail-first test that goes red if the quirk is violated and delete the comment. A gotcha guarded only by prose rots the first time someone "simplifies" it; one guarded by a red test cannot.
- **Names reveal intent** — function names describe the action being performed.
- **Prefer few function arguments** — aim for two or three; group related parameters into an options object when the list grows.
- **No TODOs, placeholders, or stubbed branches** — implement requested functionality completely; do not leave missing pieces for later.
- **Throw exceptions, not error codes** — signal failures with thrown errors (Nest HTTP exceptions at the API boundary), not sentinel return values.
- **Prefer `interface` for object shapes** — no `I` prefix; use `type` for unions, `z.infer` results, and derived types.
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
- **Do not use `unknown` for request shapes you clearly expect** — validate boundary payloads with Zod schemas and type the parsed value with a named DTO or shared schema type.
- **Never leak stack traces to users** — user-facing messages should use safe summaries, not raw server errors.
- **No broad ESLint disables** — fix the structure or split files before adding file-level disables. Route files are the rare exception when TanStack Router requires co-located route exports and components.

## Review-Learned Guardrails

- **Run the pre-review checklist before requesting review** — for non-trivial PRs, explicitly check the common review traps before opening or re-requesting review: shared contract drift, lifecycle transitions, retry/idempotency, auth/visibility/security boundaries, batched reads, frontend pending/cleanup behavior, generated migrations, and documentation updates.
- **Keep shared contracts synchronized end to end** — when a schema, response, status, file kind, product ID, limit, or option changes, update the shared Zod schema/constants, API presenter parsing, app-client or frontend helpers/tests, mocks/seeds, and docs together. Do not leave hard-coded copies in presenters, screens, scripts, or tests.
- **Design stateful features as lifecycle machines first** — before changing durable rows such as jobs, uploads, notifications, integrations, sessions, or outbox events, name the allowed states and transitions. Late, duplicate, or stale actions must be explicit no-ops or controlled errors, and tests should prove terminal states cannot be downgraded.
- **Make retry-prone actions idempotent** — user actions, webhooks, jobs, and frontend retries should not double-consume limits, duplicate analytics/events, or downgrade terminal state. Treat already-applied actions as no-ops or return the existing durable result when that is the product behavior.
- **Use atomic writes for unique constraints** — read-then-insert is not enough for rows protected by unique keys. Use conflict-safe inserts/upserts, catch and reload duplicate-key races, or lock and conditionally update inside the transaction so concurrent requests do not turn an idempotent path into a 500.
- **New transports inherit existing security policy** — HTTP, WebSocket, webhooks, server actions, and future transports must reuse the same auth, CORS, origin, and visibility rules unless the PR explicitly documents a narrower exception. Do not use permissive transport defaults in production paths.
- **Batch presenter reads** — list, feed, table, notification, and media presenters should batch related lookups and assemble results in memory. Avoid per-row DB reads, sequential signing, and unbounded parameter lists inside result-building loops.
- **Frontend submit paths must lock pending work** — buttons, gestures, and attachment sends should reflect in-flight mutations in both `disabled` and loading states. Preserve drafts or local selections until the server confirms success, and make retry behavior explicit.
- **Frontend effects must clean up runtime work** — timers, listeners, object URLs, upload previews, subscriptions, sockets, and deferred callbacks must be cleared on unmount, logout, account switch, and relevant dependency changes.
- **Generated migrations are part of review readiness** — entity-driven schema changes should use the project migration generator, and constraint/rename changes should be checked against both fresh and existing database shapes when practical.
- **Audit trust boundaries first** — deep-link params, OAuth callback params, redirect URIs, bearer headers, route params, and provider payloads are untrusted until normalized and validated.
- **Keep secrets out of URLs and UI** — bearer tokens, refresh tokens, share tokens, and equivalent credentials must not appear in redirect query strings, examples, logs, screenshots, or user-facing debug text.
- **Check protocol parity, not just endpoint parity** — if a new client reuses an existing flow, match the full protocol behavior, including headers, pagination, retry semantics, cache invalidation, and completion calls.
- **Design explicit failure states for async writes** — user-triggered mutations, uploads, native calls, and provider handoffs need `try`/`catch` or equivalent error handling that resets transient state and gives the user a recovery path.
- **Validate state transitions after optimistic UI changes** — drafts, selected modes, cached auth state, pagination state, and navigation state should be reset or preserved intentionally on success, cancel, and failure.
- **Turn repeated PR lessons into module rules** — when review feedback reveals a durable contract or invariant, document it in the root or owning module `AGENTS.md` before asking for another review pass.
- **CSS lives in cascade layers** — base resets and element styles belong in `@layer base`, reusable component classes in `@layer components` (`apps/web/src/styles.css`). Unlayered CSS outranks *every* Tailwind v4 utility regardless of specificity, so an unlayered reset silently defeats `border-*`/`text-*`/font/sizing overrides; keep `@font-face`, `@keyframes`, and `!important` behavioral rules (reduced-motion, Radix scroll-lock) unlayered. (Receipt: the base reset shipped unlayered and utility overrides were being ignored until it was moved into `@layer base`.)

## Conventions

- **ESM only** — keep `"type": "module"` and modern TS/ESM imports.
- **Zod for validation** — schemas live in `packages/shared/src/`.
- **Shared types** come from `@bootstrap/shared`.
- **Const arrays over enums** — prefer `as const` arrays plus `z.enum()`.
- **Dependencies live where they are used** — root dependencies are only for truly shared tooling.
- **Scoped config changes** — do not change one app's tooling config unless that app needs it.
- **Keep auth flows consistent** — cookie semantics, redirect handling, and refresh behavior should stay aligned across providers.
- **Prefer explicit filenames** — e.g. `auth.service.ts`, `google-oauth.service.ts`, `cookie.service.ts`.
- **Single-column uniqueness belongs on the column** via `@Column({ unique: true })`.
- **Regenerate unmerged migrations when safe** — if a migration only exists on the current PR branch, has not been merged, and has not been run in any shared environment, prefer deleting it and regenerating/rewriting the clean canonical migration instead of adding follow-up fix migrations.
- **UUIDv7 IDs** — primary IDs use `text` columns and are assigned with `generateId()` in `@BeforeInsert`. Do not use Postgres-generated UUID defaults for app-owned entity IDs.
- **Entity hooks do not run for plain upserts** — if an insert depends on `@BeforeInsert`, use `repository.create()` + `repository.save()` or explicitly provide the generated value.
- **Use `text` for database strings** — do not use `varchar` unless there is a concrete database-level reason for a bounded string column.
- **Explicit column types are preferred** — TypeORM decorators should declare `type` for string, timestamp, and JSON columns so runtime behavior does not depend on reflected metadata alone.
- **Timestamps are `timestamptz` at precision 3** — use the decorators in `apps/api/src/db/date-columns.ts` (`CreatedAtColumn`, `UpdatedAtColumn`, `DeletedAtColumn`, `TimestamptzColumn`), never raw `@CreateDateColumn()`/`type: 'timestamp'`. `timestamptz` keeps a stored value an unambiguous instant; precision 3 matches the millisecond `Date` the `pg` driver hydrates, so a keyset cursor cannot skip rows on a sub-millisecond fraction.
- **Entities and migrations are registered explicitly** — every entity goes in `apps/api/src/db/entities.ts` (`APP_ENTITIES`) and every migration in `apps/api/src/db/migrations.ts` (`APP_MIGRATIONS`); TypeORM never scans the filesystem. Glob-loaded `.ts` entities/migrations do not resolve under the swc/jest transform, so the in-process integration harness needs the imported-class arrays. Add each new migration to `APP_MIGRATIONS` when you generate it.
- **Avoid definite assignment assertions in entities** — TypeORM entity fields should be regular properties without `!`; `strictPropertyInitialization` is disabled for this ORM pattern.
- **Service decomposition over large workflow classes** — orchestration can call smaller helpers or services.
- **Transactions are not a reason to keep logic monolithic** — pass transactional context when needed.
- **Multi-row state changes should be atomic** — when one user action updates several tables that must agree, wrap the writes in one transaction and test through the transactional manager path.
- **Serialize transactional writes on one DB client** — inside a TypeORM transaction, avoid parallel query patterns that can make `pg` issue overlapping queries on the same client. Save rows sequentially or use one explicit bulk query.
- **Generic over speculative** — do not design for hypothetical future domains until the product needs them.
- **Extract shared utilities instead of duplicating** — two usages is a signal, three is a requirement.
- **Conventional commits** — `<type>(<optional scope>): <short imperative summary>`.
- **One source of truth for shared limits** — byte limits, content-type options, status options, and kind options belong in `packages/shared` when more than one layer uses them.
- **Keep Zod enums tuple-safe** — define explicit `as const` option arrays for `z.enum()` and avoid inline spread arrays that widen to `string[]`.
- **Map content types intentionally** — when generating fallback filenames or object keys, use explicit content-type-to-extension maps. Do not derive extensions with `contentType.split('/')`.

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

## Data Access and Service Composition

These rules keep the persistence layer testable and free of cycles as the app grows.

- **Repository convention** — DB access for an entity goes through its repository, which extends `apps/api/src/db/base.repository.ts` (manager-aware, one per aggregate root). Business services orchestrate repositories and own the transaction boundary: open `dataSource.transaction(...)` and thread the `manager` into every repository call. Repositories are leaf-level (inject only `DataSource`, never another service) so they compose across modules without a cycle. No service hand-writes `dataSource.getRepository(OtherEntity)`; reach a child entity through its aggregate root and a cross-aggregate read through a query method.
- **Composition over inheritance** — compose injected collaborators. No `forwardRef`, no domain-service inheritance. The one sanctioned base class is `BaseRepository` (data-access infrastructure). Share by extracting a focused service, not by subclassing one.
- **Keep breakable logic out of the write path** — put the logic that is easy to get wrong (pure planners/resolvers) in functions you can unit-test in isolation, and keep the persistence path thin. The template is: preflight (all external/non-DB work, zero DB writes) → a manager-aware write method → a thin facade that runs preflight then one `dataSource.transaction`.
- **Errors surface as one envelope** — throw Nest HTTP exceptions at the boundary; `apps/api/src/common/api-exception.filter.ts` maps them to the shared `apiErrorSchema` shape (`{ statusCode, error, message, requestId?, details? }`) and logs 5xx with the request id. Validate request payloads with the Zod pipe in `apps/api/src/common/zod/` (`ZodBody`/`ZodParam`/`ZodQuery`) so a bad body becomes a 400 with `details`, never an unhandled 500.

## Common Pitfalls

- **Truthiness checks hiding valid values** — do not accidentally discard `''` or `0` when those values are meaningful.
- **Dropped async failures** — either `await` the promise or attach a `.catch()`.
- **Missing cleanup** — timers, clients, and listeners need explicit teardown behavior.
- **Coercive global helpers** — prefer `Number.isFinite`, `Number.isNaN`, and `Number.parseInt`.
- **Loading too much data** — fetch the minimum data needed for the active path.
- **Tests that end too early** — if code writes to the DB or returns a structured result, verify the final outcome, not only the mock interaction.
- **Missing the API prefix in callbacks** — external callback URLs must include `/api/...` because the Nest app serves everything under that prefix.
- **N+1 queries** — never write per-row database lookups inside loops. Fetch related records in bulk with joins, query builders, or batched `In([...])` queries, then assemble results in memory.
- **Unbounded provider calls** — outbound calls to third-party providers must have explicit timeouts and convert network/timeout failures into controlled API errors.
- **Non-idempotent webhooks** — assume providers retry webhooks. Persist provider callbacks so retries replace or no-op safely rather than duplicating rows or downgrading terminal state.

## Testing

Tests are the gate before a user experiences the problem. Write every test to fail when the behavior it describes breaks; a green check that can never go red hides the regression it claims to guard.

- **Assert the expected value, not its existence** — if you can name the value, shape, status, or message, assert it. `toBeDefined()`/`toBeTruthy()` is not a test when you can write the literal expected result (URLs, paths, statuses, ids). Recompute nothing the code should produce.
- **Prove the test can fail before keeping it** — break the code under test and confirm the assertion goes red. If it still passes, it asserts nothing; fix it or delete it.
- **A bug fix ships a test that proves the bug** — red on the unfixed code, green only once the real fix lands, on the actual code path.
- **Never buy a green with a workaround** — a path that will not pass without a hacked code path, a skipped step, or a doctored fixture is the symptom of a real bug; fix the code the product runs. An honest red beats a green bought that way.
- **Verify observable end state, not intermediate bookkeeping** — prefer returned values, final persisted state read back, and the error a bad path throws over "a mock was called". For write paths, read the durable result back and assert it.
- **Cover the happy path, edge cases, and negatives** — malformed/missing/empty/null input, boundary values, duplicate/replay, unauthorized access, and the failure the code is supposed to reject.
- **Prefer the real service and a real database over mocks** — DB-hitting paths are proven against real Postgres (`test:integration` boots the real module against `bootstrap_test`). Mock only systems you do not control (third-party HTTP such as Google). When you edit a mock-heavy test, convert it to the real path rather than patching the mock.
- **No swallowed failures** — no try/catch that lets a thrown assertion pass, no assertion after an early return/throw, no snapshot regenerated just to match current output without reading whether that output is correct.

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
pnpm --filter @bootstrap/api test:smoke
pnpm --filter @bootstrap/api test
pnpm --filter @bootstrap/api test:integration
pnpm --filter @bootstrap/web test
pnpm --filter @bootstrap/shared test
pnpm --filter @bootstrap/web build
pnpm format:check
```

If `format:check` fails, run `pnpm format`.

### API integration tests

`pnpm --filter @bootstrap/api test:integration` boots the real `AppModule` against a dedicated `bootstrap_test` database and drives HTTP flows with supertest. Each worker gets its own database cloned from a migrated template (`bootstrap_test_<scope>_*`), created next to the configured `DATABASE_URL`, so concurrent checkouts do not collide. Like the smoke test it needs the local Postgres container running (`pnpm db:up`). Integration specs are named `*.integration.spec.ts` under `src/test/integration/`; the `schema-drift` spec proves the hand-written migrations produce exactly the schema the entities declare.

### API smoke test

`pnpm --filter @bootstrap/api test:smoke` compiles the Nest `AppModule` with the same module graph the API boots locally. Keep this check in CI and update it whenever API module wiring, providers, imports, or required environment variables change.

This smoke test catches dependency-injection errors, circular module/provider relationships, missing exports, and startup-only configuration issues that unit tests can miss. These failures sometimes appear only when the app is started locally or when the full module graph is compiled, even if narrower CI checks pass.

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
