# Implementation Plan: Full-Window WSPR Map Experience

**Branch**: `002-deckgl-map-ui` | **Date**: 2026-05-17 | **Spec**: `specs/002-deckgl-map-ui/spec.md`

**Input**: Feature specification from `specs/002-deckgl-map-ui/spec.md`

## Summary

Rework Better Map into a full-window WSPR map experience with deck.gl-rendered selectable contact paths, browser localStorage callsign persistence, a callsign overlay/prompt flow, five-minute refresh countdown with manual refresh, selectable OpenStreetMap Standard/OpenTopoMap/OpenStreetMap Humanitarian base layers, map-overlay contact details showing all WSPRNET/WSPR payload fields, and a subtle code-version hash with frontend/backend mismatch detection. Keep the existing WSPR activity API behavior intact while adding a lightweight backend version-hash exposure.

## Technical Context

**Language/Version**: TypeScript 6.x with React 19 for frontend; Python 3.11+ FastAPI backend remains available for the existing WSPR activity API.

**Primary Dependencies**: Existing Vite, React, TypeScript, Vitest, Testing Library, MapLibre GL JS; add deck.gl packages for overlay/path rendering. Existing FastAPI/httpx backend dependencies unchanged; backend adds a version metadata route using existing FastAPI patterns.

**Storage**: Browser localStorage for the active callsign only. No server-side persistence or account storage.

**Testing**: Frontend lint, typecheck, Vitest component/service tests with 100% coverage, and build. Existing backend Ruff, mypy, and pytest coverage commands remain required because the repo constitution requires full automated quality gates.

**Target Platform**: Browser-based UI on desktop and mobile-sized viewports, served by the existing Vite frontend and backed by the existing local/deployed WSPR API.

**Project Type**: Web application with Vite React frontend and FastAPI backend.

**Performance Goals**: Initial callsign-scoped map result or empty state appears within 10 seconds after confirming a callsign; manual refresh starts within 1 second when idle; automatic refresh starts within 5 seconds of countdown reaching zero; map pan, zoom, path hover/click, and overlay updates respond within 250 milliseconds with up to 1,000 displayed paths.

**Constraints**: deck.gl is mandatory for rendering map overlays and selectable contact paths; contact data requests use the active callsign; polling interval defaults to 5 minutes after refresh completion or failure; no duplicate overlapping refreshes; previous successful data remains visible on refresh failure; persistent contact list is removed; active base map layer must respect attribution and usage constraints; localStorage is scoped to the current browser profile/device; required attribution has placement priority over the short code-version hash; frontend/backend short-hash mismatches are shown as non-destructive errors.

**Scale/Scope**: Up to 1,000 displayed WSPR paths from the existing 10-day callsign lookup; one active callsign at a time; one selected contact at a time; three required base map layers (OpenStreetMap Standard, OpenTopoMap, OpenStreetMap Humanitarian); one visible frontend short hash plus backend mismatch status; no user accounts, cross-device sync, custom refresh intervals, custom date ranges, or backend map-layer registry.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **User-Centric UX**: PASS. The plan emphasizes a full-window map, minimal setup for returning users, direct path selection, non-destructive refresh failures, and accessible overlay controls.
- **Community-Driven Extensibility**: PASS. Base map definitions and deck.gl layer construction are planned as frontend configuration/service boundaries so future providers or layers can be added without rewriting the app shell.
- **Automated Quality Assurance**: PASS. Plan requires frontend lint/typecheck/build/tests with 100% coverage and preserves backend quality gates because the repository constitution requires full automated checks.

## Project Structure

### Documentation (this feature)

```text
specs/002-deckgl-map-ui/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/better_map/api/
├── src/better_map/models/
├── src/better_map/services/
└── tests/

frontend/
├── src/
│   ├── components/
│   │   ├── WsprMap.tsx
│   │   ├── ActivityDetails.tsx
│   │   └── new overlay/control components as needed
│   ├── services/
│   │   ├── wsprActivity.ts
│   │   ├── callsign.ts
│   │   ├── mapFeatures.ts
│   │   └── new map layer/local storage helpers as needed
│   ├── App.tsx
│   ├── App.css
│   └── index.css
└── src/**/*.test.ts(x)

scripts/
├── start-backend.sh
└── start-frontend.sh
```

**Structure Decision**: Use the existing split web-app structure. Most changes are in `frontend/src` because the existing activity API already returns map-ready GeoJSON LineString features. Backend changes are limited to exposing version metadata through existing FastAPI patterns and adding corresponding contract tests.

## Complexity Tracking

No constitution violations identified.

## Phase 0: Research Summary

Research complete in `specs/002-deckgl-map-ui/research.md`. All technical choices are resolved with no remaining clarifications.

## Phase 1: Design Summary

Design artifacts generated:

- `specs/002-deckgl-map-ui/data-model.md`
- `specs/002-deckgl-map-ui/contracts/ui.md`
- `specs/002-deckgl-map-ui/quickstart.md`

## Post-Design Constitution Check

- **User-Centric UX**: PASS. UI contract covers first-run setup, returning-user bypass, full-window map layout, overlay controls, path selection, base-layer changes, refresh status, and error/empty states.
- **Community-Driven Extensibility**: PASS. Data model includes `BaseMapLayer` with attribution and usage constraints, and the UI contract isolates layer selection behavior from provider-specific implementation details.
- **Automated Quality Assurance**: PASS. Quickstart lists frontend and backend verification commands, and contracts define independently testable UI behavior for component/service tests.
