---
name: commit
description: Commit staged and unstaged changes following project conventions. Use when the user says "commit", "save changes", or asks to commit work.
user-invocable: true
---

# Commit Skill

Create commits that match the repo's conventional-commit expectations.

## Rules

1. Never amend and never force push.
2. Never skip hooks.
3. Run project checks before committing.
4. Stage specific files, not `git add .`.
5. Never push unless explicitly asked.

## Commit message format

```text
<type>(<optional scope>): <lowercase summary>
```

Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `perf`, `style`

## Workflow

1. Inspect `git status` and `git diff`
2. Run relevant checks:
   - `pnpm --filter @bootstrap/api test`
   - `pnpm --filter @bootstrap/api typecheck`
   - `pnpm --filter @bootstrap/web test`
   - `pnpm --filter @bootstrap/web typecheck`
   - `pnpm --filter @bootstrap/shared test`
   - `pnpm --filter @bootstrap/shared typecheck`
   - `pnpm format:check`
3. Stage only the intended files
4. Create the commit with a conventional commit message
