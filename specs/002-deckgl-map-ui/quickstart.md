# Quickstart: Full-Window Deck.gl WSPR Map

## Prerequisites

- `uv`
- Node.js and npm
- `cloudflared` for Cloudflare tunnel/proxy support

## Install Frontend Dependencies

```bash
cd frontend && npm install
```

Expected result: npm installs the existing frontend dependencies plus deck.gl packages added by implementation tasks.

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

## Manual Verification

1. Clear the app callsign value from browser localStorage.
2. Open the frontend URL and confirm the map fills the browser window without frames, borders, or a persistent contact list.
3. Confirm a callsign prompt appears before any callsign-specific data loads.
4. Enter a valid callsign and confirm the callsign appears in a right-side overlay panel.
5. Reload the page and confirm the saved localStorage callsign bypasses setup.
6. Click the callsign overlay, change the callsign, and confirm data refreshes for the new callsign.
7. Confirm WSPR paths render as selectable deck.gl overlays.
8. Click a path and confirm the details panel shows all WSPRNET/WSPR API payload fields for the selected contact.
9. Confirm the countdown shows five minutes after refresh completion and clicking it starts an immediate refresh when idle.
10. Select OpenStreetMap Standard, OpenTopoMap, and OpenStreetMap Humanitarian and confirm WSPR overlays, callsign context, countdown, and selected details remain intact.
11. Confirm active base map attribution is visible or accessible.
12. Confirm the short frontend code-version hash is visible as small low-opacity monospace text near the bottom-left corner and does not block required attribution or map controls.
13. Simulate or configure a frontend/backend version hash mismatch and confirm a clear non-destructive error appears.
14. Simulate a refresh failure and confirm previous successful paths remain visible with a clear error.

## Planned Verification Commands

```bash
cd backend && uv run ruff check . && uv run mypy src tests && uv run pytest --cov=src --cov-fail-under=100
cd frontend && npm run lint && npm run typecheck && npm run test:coverage && npm run build
cd backend && uv run pytest ../tests/scripts --cov=../tests/scripts --cov-fail-under=100
```

## Implementation Verification Notes

- Frontend automated checks cover callsign persistence, full-window overlay layout, deck.gl path selection, base map changes, refresh behavior, contact details, and version mismatch status.
- Backend automated checks cover the version hash endpoint alongside the existing health and WSPR activity API contracts.
- Manual verification should still be run in a browser to confirm visual overlay stacking, map tile attribution placement, and real tile/provider behavior.
