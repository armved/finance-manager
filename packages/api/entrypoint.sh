#!/bin/sh
set -e

echo "=== Running database migrations ==="
cd /app/packages/api
NO_COLOR=1 CI=true /app/node_modules/.bin/drizzle-kit migrate
echo "=== Migrations complete ==="

echo "=== Starting server ==="
exec node --import tsx/esm /app/packages/api/src/server.ts
