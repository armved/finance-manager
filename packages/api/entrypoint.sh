#!/bin/sh
set -e

echo "=== Running database migrations ==="
cd /app/packages/api
node --import tsx/esm src/db/migrate.ts
echo "=== Migrations complete ==="

echo "=== Starting server ==="
exec node --import tsx/esm /app/packages/api/src/server.ts
