# Implementation Plan: WSPR Callsign Activity Map

**Branch**: `001-wspr-map-integration` | **Date**: 2026-05-16 | **Spec**: `specs/001-wspr-map-integration/spec.md`

**Input**: Feature specification from `specs/001-wspr-map-integration/spec.md`

## Summary

Build the first end-to-end Better Map feature: a casual HAM radio operator enters a callsign, the app retrieves public WSPR activity for the last 10 days, and the frontend renders up to the most recent 1,000 transmitter-to-receiver paths on an interactive map. The backend will isolate WSPR data-source access, enforce validation, timeout, and result-bounding rules, and return map-ready data. Repository-root shell scripts will start the backend and frontend, with the frontend script also requiring a successful Cloudflare tunnel/proxy startup.

## Technical Context

**Language/Version**: Python 3.11+ for backend; TypeScript 6.x with React 19 for frontend

**Primary Dependencies**: FastAPI, Uvicorn, httpx, pytest, pytest-cov, Ruff, mypy or pyright for backend typechecking; Vite, React, TypeScript, Vitest, Testing Library, MapLibre GL JS or equivalent WebGL-capable map renderer; cloudflared CLI for local tunnel/proxy

**Storage**: No persistent application storage for this feature; WSPR data is fetched on demand and returned as bounded map-ready JSON

**Testing**: pytest for backend unit/contract tests with 100% coverage; Ruff linting and backend typechecking; frontend lint/build/typecheck plus Vitest component/service tests with 100% coverage; script-level smoke/static tests where practical

**Target Platform**: Local developer machines and Railway-hosted web deployment path; browser-based UI

**Project Type**: Web application with FastAPI backend and Vite React frontend

**Performance Goals**: Callsign search shows mapped activity in under 5 seconds when the provider returns up to 1,000 valid records within the 10-second provider timeout; at least 90% of a curated 20-callsign validation set with known WSPR activity shows visible map results without extra configuration; provider timeout error appears within 10 seconds; map pan, zoom, and item selection respond within 250 milliseconds with up to 1,000 displayed activity records

**Constraints**: Public callsign lookup requires no application login; callsign input is 3-12 characters with letters, digits, and `/`; WSPR lookup must query both transmitter and receiver roles from a WSPR-compatible provider, initially WSPR.live; result set is deduplicated and capped to the most recent 1,000 records; provider timeout, rate limit, unavailable, and invalid-data cases require distinct user-facing messages; failed lookups preserve previous successful map results; Cloudflare tunnel/proxy failure stops frontend startup; logs may include callsigns but must not include IP addresses or browser identifiers

**Scale/Scope**: First feature supports single-callsign lookup for a fixed 10-day window; no accounts, saved searches, custom date ranges, data persistence, or multi-source integration registry yet

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **User-Centric UX**: PASS. The design provides a prominent accessible callsign search, visual transmitter-to-receiver paths, clear loading/empty/error/timeout states, non-destructive lookup failure handling, and explicit truncation messaging.
- **Community-Driven Extensibility**: PASS. WSPR access is planned behind backend service boundaries with map-ready contracts, so future data providers can follow the same provider-to-map-item pattern.
- **Automated Quality Assurance**: PASS. Plan includes backend tests, frontend lint/build/component coverage, API/UI contracts, and start-script behavior checks.

## Project Structure

### Documentation (this feature)

```text
specs/001-wspr-map-integration/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api.md
│   └── ui.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── main.py
├── pyproject.toml
├── src/
│   └── better_map/
│       ├── api/
│       ├── models/
│       └── services/
└── tests/
    ├── contract/
    └── unit/

frontend/
├── package.json
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

scripts/
├── start-backend.sh
└── start-frontend.sh

tests/
└── scripts/
```

**Structure Decision**: Use the existing split web-app structure with `backend/` for FastAPI and `frontend/` for Vite React. Add root-level `scripts/` so contributors can start services without knowing subproject commands. Use root-level `tests/scripts/` for repository script validation. Keep provider-specific WSPR-compatible provider code, initially WSPR.live, inside backend services, not frontend components.

## Complexity Tracking

No constitution violations identified.

## Phase 0: Research Summary

Research complete in `specs/001-wspr-map-integration/research.md`. All technical unknowns are resolved for initial implementation.

## Phase 1: Design Summary

Design artifacts generated:

- `specs/001-wspr-map-integration/data-model.md`
- `specs/001-wspr-map-integration/contracts/api.md`
- `specs/001-wspr-map-integration/contracts/ui.md`
- `specs/001-wspr-map-integration/quickstart.md`

## Post-Design Constitution Check

- **User-Centric UX**: PASS. API and UI contracts include simple search, path rendering, loading, empty, error, timeout, and truncation states.
- **Community-Driven Extensibility**: PASS. Data source details are isolated in backend service contracts and map items are provider-neutral.
- **Automated Quality Assurance**: PASS. Contracts define testable behavior and quickstart lists verification commands.
