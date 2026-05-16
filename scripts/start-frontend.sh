#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_PORT="${FRONTEND_PORT:-5212}"
FRONTEND_URL="http://127.0.0.1:${FRONTEND_PORT}"
FRONTEND_PID=""
CLOUDFLARED_PID=""
TMP_LOG=""

if ! command -v cloudflared >/dev/null 2>&1; then
  printf 'Cloudflare tunnel failed: cloudflared is not installed. Install cloudflared and try again.\n' >&2
  exit 1
fi

cd "$ROOT_DIR/frontend"
npm run dev -- --host 127.0.0.1 --port "$FRONTEND_PORT" &
FRONTEND_PID=$!

cleanup() {
  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" >/dev/null 2>&1; then
    kill "$FRONTEND_PID" >/dev/null 2>&1 || true
  fi
  if [[ -n "$CLOUDFLARED_PID" ]] && kill -0 "$CLOUDFLARED_PID" >/dev/null 2>&1; then
    kill "$CLOUDFLARED_PID" >/dev/null 2>&1 || true
  fi
  if [[ -n "$TMP_LOG" ]]; then
    rm -f "$TMP_LOG"
  fi
}
trap cleanup EXIT

TMP_LOG="$(mktemp)"
cloudflared tunnel --url "$FRONTEND_URL" >"$TMP_LOG" 2>&1 &
CLOUDFLARED_PID=$!

for _ in {1..30}; do
  if ! kill -0 "$CLOUDFLARED_PID" >/dev/null 2>&1; then
    if grep -qi 'login\|auth\|credential\|origin cert' "$TMP_LOG"; then
      printf 'Cloudflare tunnel failed: authentication is required or invalid. Run cloudflared login and try again.\n' >&2
    else
      printf 'Cloudflare tunnel failed: tunnel startup failed.\n' >&2
    fi
    cat "$TMP_LOG" >&2
    exit 1
  fi

  TUNNEL_URL="$(grep -Eo 'https://[^ ]+trycloudflare.com' "$TMP_LOG" | head -n 1 || true)"
  if [[ -n "$TUNNEL_URL" ]]; then
    printf 'Frontend: %s\nCloudflare tunnel: %s\n' "$FRONTEND_URL" "$TUNNEL_URL"
    wait "$FRONTEND_PID"
    exit $?
  fi
  sleep 1
done

printf 'Cloudflare tunnel failed: started but no tunnel URL was discovered.\n' >&2
cat "$TMP_LOG" >&2
exit 1
