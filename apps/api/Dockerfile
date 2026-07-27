# syntax=docker/dockerfile:1
# API service — NestJS run directly via swc-node (no compile step).
# Build context is the REPO ROOT (monorepo needs pnpm-workspace + packages/shared).
FROM node:22-slim
RUN corepack enable && corepack prepare pnpm@10.32.0 --activate
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
WORKDIR /app/apps/api
EXPOSE 4000
# migrationsRun is false in the app, so create tables first, then start.
# (`run build` is this repo's server-start script — swc-node runs main.ts.)
CMD ["sh", "-c", "pnpm run migration:run && pnpm run build"]
