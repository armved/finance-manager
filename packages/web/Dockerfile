FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.8.1 --activate

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/web/package.json ./packages/web/

RUN pnpm install --frozen-lockfile

COPY packages/shared/ ./packages/shared/
COPY packages/web/ ./packages/web/

RUN pnpm --filter @finance-manager/web build

FROM caddy:2-alpine

COPY --from=builder /app/packages/web/dist /srv
COPY packages/web/Caddyfile /etc/caddy/Caddyfile

EXPOSE 80
