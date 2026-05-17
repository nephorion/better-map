# Implementation Plan: Analytics, Donations, Nephorion Link, and Version Hash Fix

**Branch**: `003-next-feature-adding` | **Date**: 2026-05-17 | **Spec**: `specs/003-next-feature-adding/spec.md`

**Input**: Feature specification from `specs/003-next-feature-adding/spec.md`

## Summary

Add default page-view Google Analytics measurement for `G-PZ4DB72GNK`, a custom subtle Better Map donation control that opens an in-page Ko-fi pane for `https://ko-fi.com/museofnephorion`, a subtle Nephorion link to `https://nephorion.com`, and a Railway deployment version-hash fix so deployed builds show the real short commit hash instead of `dev`. Implement this primarily in the existing React/Vite frontend, with a small backend/version-metadata alignment so frontend and backend hash mismatch behavior continues to work.

## Technical Context

**Language/Version**: TypeScript 6.x with React 19 for the frontend; Python 3.11+ with FastAPI for the backend version endpoint and static app host.

**Primary Dependencies**: Existing Vite 8, React, MapLibre GL JS, deck.gl, Vitest, Testing Library, Playwright, FastAPI, httpx, uvicorn. No new production package is required unless the Ko-fi pane cannot be implemented safely with Ko-fi's documented script/embed pattern.

**Storage**: No new application persistence. Existing browser localStorage for map/callsign preferences remains unchanged. Analytics and Ko-fi operate through their external services.

**Testing**: Frontend ESLint, TypeScript typecheck, Vitest unit/component coverage, Playwright UI checks, and build. Backend Ruff, mypy, and pytest coverage remain required because the version endpoint behavior is in backend scope.

**Target Platform**: Browser-based UI on desktop and mobile-sized viewports, served by the existing Vite frontend and FastAPI/Railway deployment path.

**Project Type**: Web application with Vite React frontend and FastAPI backend/static host.

**Performance Goals**: Analytics and support-link additions must not block first usable map render; opening or dismissing the Ko-fi pane should respond within 250 ms after the Ko-fi resource is available; version metadata must remain non-blocking.

**Constraints**: Google Analytics tracks default page views only; no custom callsign, map, donation, or external-link analytics events. Ko-fi must use a custom subtle Better Map button and in-page donation pane, not a default floating widget or always-visible panel. Nephorion link opens in a new tab/window. Railway deployments must show actual short commit hashes, while local/non-production builds may show `dev` when commit metadata is unavailable. Existing frontend/backend mismatch warning must continue to work.

**Scale/Scope**: One analytics measurement ID, one Ko-fi page, one Nephorion destination, one donation pane at a time, one visible frontend short hash plus backend mismatch status. No account system, donation history, custom analytics event taxonomy, cookie-consent UI, payment processing implementation, or backend donation integration.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **User-Centric UX**: PASS. Plan keeps support links subtle, preserves map state, makes the Ko-fi pane dismissible, and preserves non-blocking version/hash warnings.
- **Community-Driven Extensibility**: PASS. Analytics, support destinations, and version metadata are planned as small isolated frontend/backend service boundaries so future IDs or destinations can be changed without rewriting the map shell.
- **Automated Quality Assurance**: PASS. Plan requires frontend and backend automated checks with 100% coverage, including tests for analytics insertion, support controls, Ko-fi pane behavior, Nephorion navigation, and Railway hash resolution.

## Project Structure

### Documentation (this feature)

```text
specs/003-next-feature-adding/
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
├── src/better_map/api/app.py
└── tests/

frontend/
├── src/
│   ├── components/
│   │   ├── new support/donation components as needed
│   │   └── existing map overlay components
│   ├── services/
│   │   ├── versionMetadata.ts
│   │   └── new analytics/support-link helpers as needed
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
├── tests/ui/
└── vite.config.ts
```

**Structure Decision**: Use the existing split web-app structure. Most work belongs in `frontend/src` because analytics, Ko-fi UI, and Nephorion link are browser-facing concerns. Backend work is limited to ensuring `/api/version` resolves Railway commit metadata consistently with the frontend build-time hash.

## Complexity Tracking

No constitution violations identified.

## Phase 0: Research Summary

Research complete in `specs/003-next-feature-adding/research.md`. All technical choices are resolved with no remaining clarifications.

## Phase 1: Design Summary

Design artifacts generated:

- `specs/003-next-feature-adding/data-model.md`
- `specs/003-next-feature-adding/contracts/ui.md`
- `specs/003-next-feature-adding/quickstart.md`

## Post-Design Constitution Check

- **User-Centric UX**: PASS. UI contract covers non-blocking analytics, subtle controls, dismissible Ko-fi pane, new-tab Nephorion navigation, mobile placement, and non-blocking version/hash states.
- **Community-Driven Extensibility**: PASS. Data model isolates analytics measurement, support destinations, donation pane state, and deployment version metadata as independently testable concepts.
- **Automated Quality Assurance**: PASS. Quickstart includes frontend lint/typecheck/build/tests, Playwright UI checks, and backend Ruff/mypy/pytest coverage commands.
