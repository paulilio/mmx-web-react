#!/bin/sh
# Compat shim: migrate callers gradually to docker/scripts/wait-for-db.sh.

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
exec "$SCRIPT_DIR/../../docker/scripts/wait-for-db.sh" "$@"
