# Copilot Review Instructions

## Review philosophy

Review with a high signal bar. Focus on actual defects, edge cases, validation gaps, security risks, persistence mistakes, auth/session regressions, and docs that no longer match the code.

Skip comments that are only about formatting or stylistic preference when automated tooling already covers them.

## Comment classification

Every comment must begin with exactly one severity label on its own line:

- **`[blocker]`** — unsafe, incorrect, or merge-blocking
- **`[important]`** — real defect or risk that should be fixed before merge
- **`[suggestion]`** — meaningful improvement in correctness, clarity, or maintainability

Do not post nit-level comments.

## Rules for choosing severity

- If a comment sits between two levels, choose the lower one.
- Only comment when you have strong confidence the issue is real.
- Keep each comment focused on one problem.
- Do not add praise-only review comments.

## Bug-fix PRs need tests

If a PR fixes a bug, verify that the PR includes a test that reproduces and validates the fix. Missing coverage is at least `[important]`.

## Shared contract changes

When a PR changes request/response schemas, auth payloads, cookie behavior, or session flow:

- verify the API and web stay aligned
- verify `packages/shared` was updated when the contract is shared
- treat drift between API behavior and shared schema as `[blocker]`

## Auth/session review focus

Be especially careful around:

- cookie options in dev vs production
- refresh token rotation and invalidation
- redirect safety in OAuth flows
- missing validation on provider callback inputs
- exposing raw server errors to the browser
- any code path that skips the normal session issuance flow

## TypeScript inference

Do not flag correct TS inference just because types are not written explicitly. Flag actual `any` leakage, compile errors, or runtime-risky typing.

## Zod v4

This repo uses Zod v4. Suggestions must use the v4 API:

- `z.email()`, `z.url()`, `z.uuid()` are top-level
- prefer `error.issues`
- prefer `z.output<typeof schema>` when output typing clarity matters

Do not suggest deprecated v3 patterns.

## Tests

- For write paths, do not accept tests that only assert mocks when the code should demonstrate final persisted state.
- For frontend auth changes, make sure redirects and session recovery paths stay covered.
- Prefer literal expectations for URLs, cookie names, and route paths instead of importing the same constant that production uses.

## Documentation drift

If a PR changes architecture, flows, invariants, or key files in a module that has an `AGENTS.md`, require the documentation update in the same PR.

## Repo conventions

Use the repo `AGENTS.md` as the source of truth for style and architecture expectations, but do not limit reviews only to documented rules.
