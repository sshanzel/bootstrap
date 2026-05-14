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

For a new product, initialize the copied starter first:

```bash
pnpm init:project -- --name "My App"
```

This updates package names, import scopes, browser/API titles, local database names, Docker/Tilt defaults, docs, and lockfile references from the starter defaults to your app. By default it derives:

- package/app slug from the name, e.g. `my-app`
- package scope from the slug, e.g. `@my-app/api`
- database name from the name, e.g. `my_app`

You can override those values:

```bash
pnpm init:project -- --name "My App" --slug my-app --scope my-org --db-name my_app
```

To make the copy a fresh repository too, add `--reset-git`. This removes the copied `.git` directory and runs `git init`, so use it only after copying the starter into a new project folder.

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

## New Project Checklist

After initialization, update these project-specific pieces:

- `apps/api/.env` and `apps/web/.env` with real secrets, URLs, and Google OAuth credentials
- Google OAuth redirect/callback settings for the new app
- README product description and any UI starter copy in `apps/web/src/routes.tsx`
- local Postgres host port in `docker-compose.yml` if another project already uses `5434`
- CI/repository settings once the new git remote exists
