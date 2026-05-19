# Implementation Plan: Configuration Panel

**Branch**: `007-add-config-panel` | **Date**: 2026-05-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-add-config-panel/spec.md`

## Summary

Add a bottom-left cog control that opens a configuration panel, use that panel as the first-run prompt when no callsign is selected, persist user map preferences locally, validate 4-character and 6-character Maidenhead grid locator entries, support multi-select amateur band and mode preferences with Mixed as an unfiltered state, and filter current WSPRnet map results by selected bands only. Mode preferences are saved for future logbook result filtering but do not filter current WSPRnet results.

## Technical Context

**Language/Version**: TypeScript 6.x with React 19 for the frontend; Python 3.11+ backend remains unchanged.

**Primary Dependencies**: Existing Vite 8, React, MapLibre GL JS, deck.gl, Vitest, Testing Library, and Playwright. No new production dependency is required for this feature.

**Storage**: Existing browser localStorage pattern, extended from callsign/map-view preferences to configuration preferences. No backend storage.

**Testing**: Frontend ESLint, TypeScript typecheck, Vitest unit/component coverage, Playwright UI checks, and frontend build. Backend checks are not in scope because no backend change is planned.

**Target Platform**: Browser-based WSPR map on desktop and mobile-sized viewports.

**Project Type**: Web application with Vite React frontend and FastAPI static/API host.

**Performance Goals**: Configuration open/save interactions complete without map reloads or map position resets; band filtering updates visible WSPR paths within the same render cycle as preference changes; WSPR filtering remains linear over the current result set.

**Constraints**: Preserve existing callsign search, map view persistence, base-map selection, grayline overlay, activity detail selection, support/source links, analytics behavior, and version status. Mixed means no filter. Current WSPRnet results are filtered by band only, never by saved mode preferences.

**Scale/Scope**: Frontend-only change covering one map shell, one configuration panel, one local preference model, one WSPR result filter, desktop viewport checks, and mobile viewport checks.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **User-Centric UX**: PASS. The cog control gives users a persistent, discoverable entry point and the first-run panel removes the older callsign-only blocking prompt when no callsign is selected.
- **Community-Driven Extensibility**: PASS. Band, mode, Maidenhead validation, and WSPR filtering are planned as small frontend service boundaries so future logbook filtering can reuse the saved mode preferences.
- **Automated Quality Assurance**: PASS. Plan requires unit tests for validation/filtering/storage, component tests for the configuration panel and first-run behavior, and Playwright smoke tests for desktop/mobile usability while maintaining 100% coverage.

## Project Structure

### Documentation (this feature)

```text
specs/007-add-config-panel/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/
│   └── ui.md            # UI contract for configuration behavior
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── spec.md              # Feature specification
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── WsprMap.tsx                  # MODIFIED — render config cog/panel and filtered paths
│   │   ├── WsprMap.test.tsx             # MODIFIED — first-run, filter, and preservation tests
│   │   ├── ConfigPanel.tsx              # NEW — configuration dialog form
│   │   └── ConfigPanel.test.tsx         # NEW — panel validation and selection tests
│   ├── services/
│   │   ├── userConfig.ts                # NEW — preference defaults, storage, validation helpers
│   │   ├── userConfig.test.ts           # NEW — storage and Maidenhead validation coverage
│   │   ├── wsprFilters.ts               # NEW — band filter helpers for WSPR features
│   │   └── wsprFilters.test.ts          # NEW — Mixed, single-band, multi-band, unknown-band coverage
│   └── index.css                        # MODIFIED — cog button and panel layout styles
└── tests/
    └── ui/
        └── map-ui.spec.ts               # MODIFIED — desktop/mobile config smoke checks
```

**Structure Decision**: Keep the feature frontend-only. Configuration state and validation belong in `frontend/src/services/userConfig.ts` for deterministic unit coverage; WSPR band filtering belongs in a dedicated service so it can be reused outside `WsprMap`; the dialog UI belongs in a new component next to existing overlay components; map wiring remains in `WsprMap.tsx`.

## Complexity Tracking

No constitution violations identified.

## Phase 0: Research Summary

Research complete in `specs/007-add-config-panel/research.md`. All technical choices are resolved with no remaining clarifications.

## Phase 1: Design Summary

Design artifacts generated:

- `specs/007-add-config-panel/data-model.md`
- `specs/007-add-config-panel/contracts/ui.md`
- `specs/007-add-config-panel/quickstart.md`

## Post-Design Constitution Check

- **User-Centric UX**: PASS. The design preserves current map controls, keeps configuration reachable after first-run, defines empty/error states, and makes Mixed filtering behavior explicit.
- **Community-Driven Extensibility**: PASS. The configuration model separates stored mode preferences from current WSPR band filtering so future logbook filters can be added without changing first-run UX.
- **Automated Quality Assurance**: PASS. The design includes unit/component/UI coverage targets for each behavioral requirement and keeps existing lint, typecheck, build, and coverage gates explicit.
