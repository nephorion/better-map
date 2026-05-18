# Implementation Plan: Add AGPL v3 License

**Branch**: `005-add-agpl-license` | **Date**: 2026-05-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-add-agpl-license/spec.md`

## Summary

Adopt GNU Affero General Public License v3 (only — not "or later") as the project's license, with copyright held by Nephorion. Add the full LICENSE text at the repo root, declare `AGPL-3.0-only` across all license-metadata surfaces (`frontend/package.json`, `backend/pyproject.toml`, README badge, GitHub repository metadata), add a short `SPDX-License-Identifier: AGPL-3.0-only` header to every committed source file using the comment syntax appropriate for the file type, and surface a subtle "Source" link in the running app to satisfy AGPL v3 §13 network-use obligations.

## Technical Context

**Language/Version**: TypeScript (frontend, existing), Python 3.11+ (backend, existing). No new runtime languages introduced.

**Primary Dependencies**: No new production dependencies. Frontend uses existing React/Vite/Vitest/Playwright stack; backend uses FastAPI/pytest/ruff.

**Storage**: N/A — feature is licensing metadata + a static link.

**Testing**: Existing pytest (backend, 100% coverage gate via `--cov-fail-under=100`) and Vitest + Playwright (frontend, 100% coverage gate via `npm run test:coverage`). Add a component test and Playwright assertion for the new in-app source link.

**Target Platform**: Same as existing — hosted Vite-built static frontend + FastAPI backend deployed on Railway.

**Project Type**: Web application (existing `frontend/` + `backend/`).

**Performance Goals**: No change. Source link is static and lightweight.

**Constraints**:
- Must not regress existing test or coverage gates.
- Must not change existing map workflows beyond adding the source link.
- Must use SPDX `AGPL-3.0-only` consistently across all metadata surfaces (FR-004).
- Source-file SPDX headers must use the comment syntax appropriate for each language/file type (FR-009).

**Scale/Scope**: Repository-wide change. All TypeScript, Python, CSS, and shell files in the repo receive a one-line SPDX header. One new LICENSE file at root. Four metadata declarations updated. One new frontend component and tests.

## Constitution Check

**I. User-Centric UX**: The source link is added as a subtle, persistently visible control alongside existing overlays (Nephorion link, donation link, version hash). No disruption to map workflows. PASS.

**II. Community-Driven Extensibility**: AGPL v3 itself reinforces the project's stance toward community contributions and reuse; the SPDX identifier and visible repository link make extension paths discoverable. PASS.

**III. Automated Quality Assurance**: A new `SourceLink` React component requires a Vitest component test. Playwright UI tests must assert the link is visible. Backend changes are metadata-only and exercised via existing coverage. 100% coverage gates remain in force on both sides. Ruff lint and TypeScript/eslint checks must pass. PASS.

No gate violations. Complexity Tracking section is empty.

## Project Structure

### Documentation (this feature)

```text
specs/005-add-agpl-license/
├── plan.md              # This file (/speckit.plan)
├── research.md          # Phase 0 output (/speckit.plan)
├── data-model.md        # Phase 1 output (/speckit.plan)
├── quickstart.md        # Phase 1 output (/speckit.plan)
├── contracts/
│   └── ui.md            # UI contract for the AGPL §13 source link
├── checklists/
│   └── requirements.md  # Pre-existing scaffold from earlier session
├── spec.md              # Pre-existing
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
LICENSE                                       # NEW — full AGPL v3 text + copyright header
README.md                                     # MODIFIED — add license badge + link

frontend/
├── package.json                              # MODIFIED — "license": "AGPL-3.0-only"
├── src/
│   ├── App.tsx                               # MODIFIED — render <SourceLink/>
│   ├── components/
│   │   ├── SourceLink.tsx                    # NEW — subtle in-app link to source repo
│   │   ├── SourceLink.test.tsx               # NEW — Vitest component test
│   │   └── NephorionLink.tsx (and others)    # MODIFIED — SPDX header
│   └── …                                     # All src/**/*.{ts,tsx,css} get SPDX header
└── tests/ui/
    └── map-ui.spec.ts                        # MODIFIED — assert source link visible

backend/
├── pyproject.toml                            # MODIFIED — license = "AGPL-3.0-only"
├── src/**/*.py                               # MODIFIED — SPDX header on every file
└── tests/**/*.py                             # MODIFIED — SPDX header on every file
```

**Structure Decision**: This is a repository-wide metadata + documentation + small UI addition. No new modules or services. The new `SourceLink` component lives next to existing overlay components in `frontend/src/components/`. Repo-root LICENSE and README are the canonical surfaces for static license discovery; per-file SPDX headers are the canonical surface for tooling.

## Complexity Tracking

> No constitution gate violations. Section intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| _(none)_  | _(n/a)_    | _(n/a)_                              |
