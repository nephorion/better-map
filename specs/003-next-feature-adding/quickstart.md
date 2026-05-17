# Quickstart: Analytics, Donations, Nephorion Link, and Version Hash Fix

## Prerequisites

- Frontend dependencies installed in `frontend/`.
- Backend dependencies installed in `backend/`.
- Railway deployment metadata available for deployed verification, or local environment variables set to simulate it.

## Frontend Verification

Run from `frontend/`:

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run test:e2e
```

Expected results:

- Google Analytics configuration for `G-PZ4DB72GNK` is covered by tests.
- No custom analytics events are emitted for callsigns, map interactions, donations, or external-link clicks.
- The custom Ko-fi button opens a dismissible in-page pane for `https://ko-fi.com/museofnephorion`.
- Dismissing the Ko-fi pane preserves map state.
- The Nephorion link opens `https://nephorion.com` in a new tab/window.
- Desktop and mobile UI checks confirm support links do not cover required map attribution or primary controls.

## Backend Verification

Run from `backend/`:

```bash
uv run ruff check .
uv run mypy .
uv run pytest
```

Expected results:

- `/api/version` returns the configured or Railway-derived short hash when deployment metadata is available.
- `/api/version` may return `dev` only when no explicit, Railway, or Git metadata is available.
- Existing version mismatch behavior remains covered and non-blocking.

## Railway Hash Smoke Check

After deployment, open the deployed Railway site and confirm:

- The visible version indicator is a short commit hash, not `dev`.
- The backend `/api/version` response reports the expected short hash.
- If frontend and backend hashes differ, the app shows the existing non-blocking mismatch warning.

## Manual UX Smoke Check

- Load Better Map on desktop and mobile-sized viewports.
- Confirm the map remains the visual focus.
- Open and close the Ko-fi pane.
- Activate the Nephorion link and confirm the original Better Map page remains available.
- Confirm no modal, interstitial, or animated prompt appears for support links.
