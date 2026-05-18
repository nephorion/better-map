# Quickstart: Add AGPL v3 License

## Implementation Checklist

- Add the full AGPL v3 text + copyright header to `LICENSE` at repo root.
- Declare `AGPL-3.0-only` in `frontend/package.json`, `backend/pyproject.toml`, README license badge, and rely on GitHub auto-detection from the LICENSE file.
- Add a single-line `SPDX-License-Identifier: AGPL-3.0-only` header to every committed source file using the appropriate comment syntax for the file type.
- Add a `SourceLink` React component, render it from `App.tsx` alongside existing overlay controls, and link to `https://github.com/nephorion/better-map`.
- Add a Vitest component test for `SourceLink` and a Playwright assertion that the link is visible on both desktop and mobile viewports.
- Keep existing map workflows, controls, support links, analytics behavior, and deployment behavior unchanged otherwise.

## Verification Commands

From repo root:

```bash
# Backend
cd backend && uv run pytest && uv run ruff check src tests && cd -

# Frontend
cd frontend && npm run lint && npm run typecheck && npm run test:coverage && npm run test:e2e && npm run build && cd -
```

## Manual Smoke Check

1. Open the hosted map and confirm a subtle "Source" link is visible alongside the Nephorion link, donation control, and version hash on desktop.
2. Switch to a mobile-sized viewport (e.g., 390×844) and confirm the same link is visible and reachable without covering callsign, refresh, base-map, or grayline controls.
3. Click the SourceLink and confirm it opens the canonical source repository in a new tab; the originating map tab retains callsign, base map, map position, zoom, selected WSPR path, and grayline overlay.
4. View the repository on GitHub and confirm GitHub reports the license as "GNU Affero General Public License v3.0".
5. Open `frontend/package.json` and `backend/pyproject.toml` and confirm each declares `AGPL-3.0-only`.
6. Open a sample of source files and confirm each begins with a `SPDX-License-Identifier: AGPL-3.0-only` header.

## Expected Results

- LICENSE present at repo root with full AGPL v3 text and `Copyright (C) 2026 Nephorion` header.
- All metadata surfaces declare `AGPL-3.0-only` consistently.
- Every committed source file carries a single-line SPDX header.
- The hosted application exposes a persistently visible "Source" link to the canonical repository on both desktop and mobile.
- Existing map workflows, controls, support links, analytics behavior, and deployment behavior remain unchanged.
- 100% code coverage and lint/typecheck/e2e/build gates all pass on both frontend and backend.
