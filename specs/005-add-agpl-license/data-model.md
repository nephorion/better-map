# Phase 1 Data Model: Add AGPL v3 License

This feature does not introduce runtime data structures, storage, or persisted state. It is a documentation and project-governance change with one small UI addition. The "entities" below are documentation/metadata artifacts and one in-memory UI prop set.

## Entity: Project License

**Description**: The authoritative statement that the project is licensed under GNU Affero General Public License version 3, copyright Nephorion.

**Surfaces**:
- `LICENSE` file at repository root.
- `frontend/package.json` `license` field.
- `backend/pyproject.toml` `license` field.
- `README.md` license badge.
- GitHub repository "license" metadata (auto-detected from LICENSE).
- Per-file `SPDX-License-Identifier: AGPL-3.0-only` headers.

**Fields**:
| Field | Value |
|---|---|
| SPDX identifier | `AGPL-3.0-only` |
| Copyright holder | `Nephorion` |
| Copyright year | `2026` |
| Full license text source | https://www.gnu.org/licenses/agpl-3.0.txt |

**Invariants**:
- All declared license fields MUST equal `AGPL-3.0-only`.
- No surface MAY declare a conflicting license value (e.g., MIT, proprietary, dual-license).
- The full AGPL v3 text MUST exist verbatim in the `LICENSE` file.

## Entity: License Metadata

**Description**: The structured project information that declares the selected license for tooling, package indexes, repository viewers, and per-file attribution.

**Surfaces and Values**:
| Surface | Field | Value |
|---|---|---|
| `LICENSE` | (whole file) | Full AGPL v3 text preceded by `Copyright (C) 2026 Nephorion` and AGPL "How to Apply" notice |
| `frontend/package.json` | `license` | `"AGPL-3.0-only"` |
| `backend/pyproject.toml` | `[project] license` | `"AGPL-3.0-only"` |
| `README.md` | License badge | Shields.io AGPL-3.0-only badge linking to `LICENSE` |
| Per-source-file header | First non-shebang line | `// SPDX-License-Identifier: AGPL-3.0-only` (or equivalent comment syntax) |
| GitHub | Repository "license" property | Derived automatically from root `LICENSE`, expected to read "GNU Affero General Public License v3.0" |

## Entity: License Terms

**Description**: The full legal text of AGPL v3 that defines user, contributor, host, and redistributor obligations.

**Location**: `LICENSE` at repository root.

**Construction**:
1. Header (custom, prepended):
   ```
   better-map — interactive HAM radio mapping tool
   Copyright (C) 2026 Nephorion

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as
   published by the Free Software Foundation, version 3.
   ```
2. Body: verbatim AGPL v3 text from gnu.org.

## In-memory UI Entity: SourceLink Props

**Description**: Props for the new React `SourceLink` component that satisfies AGPL §13.

| Field | Type | Default | Notes |
|---|---|---|---|
| `repositoryUrl` | `string` | `https://github.com/nephorion/better-map` | Canonical source repository URL surfaced to network users. |
| `label` | `string` | `Source` | Visible link text. |
| `ariaLabel` | `string` | `View project source code (AGPL v3)` | Accessible name. |

**Lifecycle**: Pure stateless presentational component; no client state, no fetches, no analytics events.

## Validation Rules Derived from FRs

- FR-001/FR-004: All entries in the License Metadata table MUST match `AGPL-3.0-only` (or equivalent canonical license value for `LICENSE`).
- FR-002: The `LICENSE` file MUST contain the full standard AGPL v3 text.
- FR-003: The README badge plus the in-app SourceLink together MUST make the license discoverable from every public-facing entry point (repo browse + running app).
- FR-005: Behavior changes are limited to rendering the `SourceLink`; no map workflows are affected.
- FR-006: No conflicting license statements anywhere in the repo.
- FR-008: SourceLink MUST be persistently visible while the map is open.
- FR-009: SPDX header MUST appear on every committed source file in the project.

## State Transitions

None. The license is a static declaration; the SourceLink is stateless.
