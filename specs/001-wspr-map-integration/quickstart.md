# Quickstart: WSPR Callsign Activity Map

## Prerequisites

- `uv`
- Node.js and npm
- `cloudflared` for Cloudflare tunnel/proxy support

## Start Backend

```bash
./scripts/start-backend.sh
```

Expected result: backend starts and prints a local URL such as `http://127.0.0.1:8112`.

## Start Frontend and Cloudflare Tunnel/Proxy

```bash
./scripts/start-frontend.sh
```

Expected result: frontend starts only if the Cloudflare tunnel/proxy also starts successfully. The script prints the Vite local URL and the Cloudflare tunnel/proxy URL.

If Cloudflare startup fails because `cloudflared` is missing, authentication fails, the tunnel fails to start, or no tunnel URL can be discovered, the script stops the frontend process and prints an actionable error.

## Manual Verification

1. Open the frontend URL.
2. Search for `VK2DJJ`.
3. Confirm the app shows a loading state, then plots WSPR transmitter-to-receiver paths from the last 10 days or a clear empty/error state.
4. Pan and zoom the map.
5. Select an activity path and confirm the details are readable.
6. Confirm large result sets show at most the most recent 1,000 records with a truncation notice.
7. Confirm provider slowness shows a timeout message within 10 seconds.
8. Confirm startup script failure messaging distinguishes missing `cloudflared`, authentication failure, tunnel startup failure, and missing tunnel URL discovery.

## Planned Verification Commands

```bash
cd backend && uv run ruff check . && uv run mypy src tests && uv run pytest --cov=src --cov-fail-under=100
cd frontend && npm run lint && npm run typecheck && npm run test:coverage && npm run build
cd backend && uv run pytest ../tests/scripts --cov=../tests/scripts --cov-fail-under=100
```
