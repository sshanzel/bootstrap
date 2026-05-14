# Bootstrap

Reusable full-stack monorepo foundation for new products.

## Stack

- Monorepo: pnpm workspaces
- API: NestJS + TypeORM + PostgreSQL
- Web: Vite + React 19 + TanStack Router + TanStack Query
- Shared: Zod schemas and shared types
- Auth: JWT access tokens + refresh token rotation in httpOnly cookies

## Prerequisites

- Node.js 22+
- pnpm 10+
- Docker

## Getting Started

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
docker compose up -d
pnpm --filter @bootstrap/api migration:run
pnpm --filter @bootstrap/api dev
pnpm --filter @bootstrap/web dev
```

API docs will be available at [http://localhost:4000/api/docs](http://localhost:4000/api/docs).

## Tilt

Run the full local stack with:

```bash
pnpm dev
```

Tilt will check tools, copy missing `.env` files from examples, install pnpm dependencies, start Postgres, run migrations, and serve the API and web app.
