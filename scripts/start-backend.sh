#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/backend"

HOST="${BACKEND_HOST:-127.0.0.1}"
PORT="${BACKEND_PORT:-8112}"

printf 'Starting Better Map backend at http://%s:%s\n' "$HOST" "$PORT"
PYTHONPATH=src uv run uvicorn better_map.api.app:app --host "$HOST" --port "$PORT" --reload
