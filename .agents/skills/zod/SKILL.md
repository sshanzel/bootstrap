---
name: zod
description: Reference for writing Zod v4 schemas. Use when creating or modifying Zod validation schemas.
user-invocable: false
---

# Zod v4 Reference

This repo uses Zod v4.

## Key reminders

- `z.email()`, `z.url()`, and `z.uuid()` are top-level validators
- use `z.enum()` with `as const` arrays
- use `error.issues`
- keep shared schemas in `packages/shared/src/`

## Project pattern

Define the schema and its exported type in the same file, then re-export it from `packages/shared/src/index.ts`.
