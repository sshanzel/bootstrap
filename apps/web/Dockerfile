# syntax=docker/dockerfile:1
# Web service — Vite SPA. Build the static bundle, then serve it with nginx.
# VITE_API_URL is baked at BUILD time, so it must be the API's public URL.
FROM node:22-slim AS build
RUN corepack enable && corepack prepare pnpm@10.32.0 --activate
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
ARG VITE_API_URL=http://api.127-0-0-1.nip.io
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter ./apps/web run build

FROM nginx:alpine
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
# SPA fallback so client-side routes resolve to index.html
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  location / { try_files $uri /index.html; }\n}\n' \
    > /etc/nginx/conf.d/default.conf
EXPOSE 80
