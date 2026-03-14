#!/bin/sh
# Compat shim: migrate callers gradually to docker/scripts/migrate-and-start.sh.

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
exec "$SCRIPT_DIR/../../docker/scripts/migrate-and-start.sh" "$@"
