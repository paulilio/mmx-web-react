#!/bin/sh
# Aguarda o PostgreSQL estar pronto para aceitar conexoes.
# Util em pipelines CI ou execucao manual fora do compose.

HOST="${POSTGRES_HOST:-postgres}"
PORT="${POSTGRES_PORT:-5432}"
USER="${POSTGRES_USER:-mmx}"

echo "[wait-for-db] Aguardando PostgreSQL em $HOST:$PORT..."

until pg_isready -h "$HOST" -p "$PORT" -U "$USER" 2>/dev/null; do
  echo "[wait-for-db] Banco nao disponivel. Tentando novamente em 2s..."
  sleep 2
done

echo "[wait-for-db] PostgreSQL pronto."
