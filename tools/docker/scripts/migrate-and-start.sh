#!/bin/sh
set -e

echo "[startup] Executando migracoes Prisma pendentes..."
node_modules/.bin/prisma migrate deploy

echo "[startup] Iniciando aplicacao Next.js na porta ${PORT:-3000}..."
exec node_modules/.bin/next start -p "${PORT:-3000}" -H "0.0.0.0"
