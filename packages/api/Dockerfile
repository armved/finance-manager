FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@10.8.1 --activate

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/api/package.json ./packages/api/

RUN pnpm install --frozen-lockfile

COPY packages/shared/ ./packages/shared/
COPY packages/api/ ./packages/api/

RUN chmod +x /app/packages/api/entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/app/packages/api/entrypoint.sh"]
