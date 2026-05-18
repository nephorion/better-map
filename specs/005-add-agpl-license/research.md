# Phase 0 Research: Add AGPL v3 License

All five NEEDS-CLARIFICATION items raised by the spec scan were resolved during the `/speckit.clarify` pass and recorded in spec.md → Clarifications. This document captures the supporting research and rejected alternatives.

## Decision 1 — Copyright holder

**Decision**: `Copyright (C) 2026 Nephorion` in the LICENSE preamble and any per-file headers that include attribution.

**Rationale**: The repository is hosted under the `nephorion` GitHub organization. Using a consistent legal entity in the AGPL boilerplate avoids ambiguity about who can relicense or accept CLAs in the future.

**Alternatives considered**:
- Individual maintainer name → rejected; ties the project to a single person and complicates future contributor agreements.
- Multiple contributor names → rejected; AGPL preamble convention favors a single canonical holder for first issuance.

## Decision 2 — SPDX identifier `AGPL-3.0-only`

**Decision**: Use `AGPL-3.0-only` everywhere a SPDX identifier appears (per-file headers and metadata).

**Rationale**: The spec Assumptions explicitly state "AGPL v3 only, not or later." Using `-only` matches that intent and prevents the FSF from being granted unilateral authority to relicense the project under future AGPL versions. SPDX has formally deprecated the bare `AGPL-3.0` identifier in favor of `-only` / `-or-later`.

**Alternatives considered**:
- `AGPL-3.0-or-later` → rejected; conflicts with spec Assumptions.
- Deprecated `AGPL-3.0` → rejected; flagged by current SPDX tooling.

## Decision 3 — AGPL §13 surfacing: in-app subtle "Source" link

**Decision**: Add a small persistent "Source" link to the running app UI, pointing to the canonical source repository.

**Rationale**: AGPL §13 imposes a network-use source-availability obligation that is not satisfied by README alone for hosted web apps. Reference AGPL deployments (Mastodon, Pixelfed, Diaspora\*) all expose a visible source link in their UI. The link can be styled to match existing overlay controls (Nephorion link, donation pane, version hash) so it does not disrupt map workflows.

**Alternatives considered**:
- README/repo-metadata-only → rejected; does not reach a user who only interacts with the hosted UI.
- Deferred to a later feature → rejected; AGPL §13 attaches the moment the project is licensed and deployed, so deferral would ship the deployment in a non-compliant state.

## Decision 4 — Per-file SPDX-only headers

**Decision**: Add a single-line `SPDX-License-Identifier: AGPL-3.0-only` header at the top of every committed source file (TypeScript, Python, CSS, shell, HTML), using comment syntax appropriate for the file type.

**Rationale**: Modern projects (Linux kernel, U-Boot, most Apache and AGPL projects since SPDX 2.x) have moved from verbose ~10-line boilerplate headers to a single SPDX line. This:
- Satisfies license-attribution tooling (REUSE, FOSSology, scancode).
- Provides robust provenance for individual files when copied or extracted.
- Adds minimal visual noise.
- Pairs naturally with the SPDX identifier chosen in Decision 2.

**Alternatives considered**:
- Full AGPL boilerplate header per file → rejected; verbose, redundant with LICENSE, harder to maintain.
- No per-file headers → rejected; loses per-file provenance when files are copied/extracted.

## Decision 5 — Metadata declaration surfaces

**Decision**: Declare the license on five surfaces:
1. `LICENSE` file at repo root (full AGPL v3 text + copyright header).
2. `frontend/package.json` `"license": "AGPL-3.0-only"`.
3. `backend/pyproject.toml` `license = "AGPL-3.0-only"` (SPDX-string form, the only form accepted by modern PEP 639).
4. README license badge linking to the LICENSE file.
5. GitHub repository metadata, which auto-populates from the root `LICENSE` once present.

**Rationale**: This set covers every license-detection surface known to GitHub, package indexes, language ecosystems, and human readers. It satisfies SC-002 (no conflicts) and SC-005 (detection tools identify the license).

**Alternatives considered**:
- LICENSE file only → rejected; package managers and pyproject tooling will continue to report "unknown" license without the metadata.
- Skip pyproject.toml → rejected; backend pyproject does not currently declare a license, leaving a contradiction with the project license once we ship.

## Reference Implementation Patterns

- **In-app source link**: implemented as a sibling React component to `NephorionLink` (`frontend/src/components/SourceLink.tsx`), rendered from `App.tsx` near the existing Nephorion / version / donation overlays. Styled with the existing overlay class system so it stays subtle on both desktop and mobile.
- **SPDX headers**: applied via a single repo-wide commit that prepends one line to every text file. Acceptable comment syntaxes:
  - `// SPDX-License-Identifier: AGPL-3.0-only` (TypeScript / JavaScript)
  - `# SPDX-License-Identifier: AGPL-3.0-only` (Python / TOML / shell / YAML)
  - `/* SPDX-License-Identifier: AGPL-3.0-only */` (CSS)
  - `<!-- SPDX-License-Identifier: AGPL-3.0-only -->` (HTML / Markdown — applied only where it does not affect rendering; generally omitted from Markdown).
- **License text source**: use the canonical AGPL v3 text from https://www.gnu.org/licenses/agpl-3.0.txt verbatim, preceded by the standard "How to Apply These Terms" copyright header naming Nephorion as the copyright holder for 2026.

## Open Issues

None. All clarifications resolved; no NEEDS CLARIFICATION items remain.
