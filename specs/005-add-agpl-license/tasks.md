# Tasks: Add AGPL v3 License

**Input**: Design documents from `specs/005-add-agpl-license/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui.md`, `quickstart.md`

**Tests**: Tests are included because the project constitution requires automated tests and 100% code coverage, and the plan explicitly requires Vitest, Playwright, pytest, and ruff validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files or has no dependency on incomplete tasks
- **[Story]**: Maps to the user story from `spec.md`
- Every task includes an exact repository path or repository path pattern

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare license constants and source-link target before story implementation.

- [X] T001 Define canonical repository source URL and label constants in `frontend/src/services/supportLinks.ts`
- [X] T002 [P] Create license metadata validation test scaffold in `tests/scripts/test_license_metadata.py`
- [X] T003 [P] Create SourceLink component test scaffold in `frontend/src/components/SourceLink.test.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish validation for repository-wide license declarations and SPDX headers before applying content changes.

**Critical**: No user story work should begin until this phase is complete.

- [X] T004 Implement license metadata assertions for root `LICENSE`, `README.md`, `frontend/package.json`, and `backend/pyproject.toml` in `tests/scripts/test_license_metadata.py`
- [X] T005 Implement SPDX header coverage assertions for `frontend/src/`, `frontend/tests/`, `backend/src/`, `backend/tests/`, `tests/`, and `scripts/` in `tests/scripts/test_license_metadata.py`
- [X] T006 [P] Add expected SourceLink accessible name and GitHub repository URL assertions in `frontend/src/components/SourceLink.test.tsx`

**Checkpoint**: Repository license validation and SourceLink tests exist and fail before implementation.

---

## Phase 3: User Story 1 - Confirm Project License (Priority: P1) MVP

**Goal**: Repository visitors and tooling can identify the project license as GNU Affero General Public License v3, SPDX `AGPL-3.0-only`, copyright Nephorion.

**Independent Test**: Run `uv run pytest ../tests/scripts/test_license_metadata.py` from `backend/` and verify root license, README badge, package metadata, pyproject metadata, and SPDX headers are consistent.

### Tests for User Story 1

- [X] T007 [P] [US1] Add a test that verifies the root `LICENSE` contains AGPL v3 text and `Copyright (C) 2026 Nephorion` in `tests/scripts/test_license_metadata.py`
- [X] T008 [P] [US1] Add a test that verifies README license badge text/link and package metadata use `AGPL-3.0-only` in `tests/scripts/test_license_metadata.py`

### Implementation for User Story 1

- [X] T009 [US1] Add full GNU Affero General Public License v3 text and Nephorion copyright header in `LICENSE`
- [X] T010 [US1] Add `license` field with `AGPL-3.0-only` in `frontend/package.json`
- [X] T011 [US1] Add `[project] license = "AGPL-3.0-only"` in `backend/pyproject.toml`
- [X] T012 [US1] Add AGPL-3.0-only badge and license link near the top of `README.md`
- [X] T013 [US1] Add SPDX headers to frontend app and UI test files in `frontend/src/` and `frontend/tests/`
- [X] T014 [US1] Add SPDX headers to backend source and test files in `backend/src/` and `backend/tests/`
- [X] T015 [US1] Add SPDX headers to repository script and root test files in `scripts/` and `tests/`

**Checkpoint**: User Story 1 is complete when repository license metadata and source headers consistently report `AGPL-3.0-only`.

---

## Phase 4: User Story 2 - Understand Network-Use Obligations (Priority: P2)

**Goal**: A hosted app user can reach the corresponding source repository from a subtle, persistent in-app Source link that satisfies AGPL v3 §13.

**Independent Test**: Run `npm test -- SourceLink App` and `npm run test:e2e` from `frontend/`; verify the Source link is visible, accessible, and opens the canonical repository without disrupting map UI.

### Tests for User Story 2

- [X] T016 [P] [US2] Add SourceLink render, href, target, rel, and accessible-name tests in `frontend/src/components/SourceLink.test.tsx`
- [X] T017 [P] [US2] Add App integration test proving the Source link appears alongside existing support/version controls in `frontend/src/App.test.tsx`
- [X] T018 [P] [US2] Add Playwright desktop and mobile assertions for the Source link in `frontend/tests/ui/support-links.spec.ts`

### Implementation for User Story 2

- [X] T019 [US2] Implement stateless SourceLink component using `SOURCE_REPOSITORY_URL` and `SOURCE_LINK_LABELS` in `frontend/src/components/SourceLink.tsx`
- [X] T020 [US2] Render SourceLink from the app shell without replacing existing Nephorion, donation, version, callsign, refresh, base-map, or grayline controls in `frontend/src/App.tsx`
- [X] T021 [US2] Add subtle responsive SourceLink styling that matches existing overlay controls in `frontend/src/App.css`
- [X] T022 [US2] Export source link constants without changing existing support-link behavior in `frontend/src/services/supportLinks.ts`

**Checkpoint**: User Story 2 is complete when the running app exposes a visible, accessible Source link on desktop and mobile.

---

## Phase 5: User Story 3 - Preserve Existing Product Behavior (Priority: P3)

**Goal**: Adding license information and a Source link does not change core map functionality, data lookup, support links, analytics behavior, or deployment behavior.

**Independent Test**: Run existing frontend and backend validation suites and verify core map workflows still pass with the new Source link present.

### Tests for User Story 3

- [X] T023 [P] [US3] Extend App tests to prove existing Nephorion link, donation control, version hash, callsign prompt, and refresh controls remain present after adding SourceLink in `frontend/src/App.test.tsx`
- [X] T024 [P] [US3] Extend Playwright map smoke tests to prove callsign, refresh, base-map, grayline, support, and Source controls remain reachable on desktop and mobile in `frontend/tests/ui/map-ui.spec.ts`
- [X] T025 [P] [US3] Add a test proving SourceLink does not emit or require analytics events in `frontend/src/services/analytics.test.ts`

### Implementation for User Story 3

- [X] T026 [US3] Adjust overlay layout only as needed to keep existing controls reachable after SourceLink is added in `frontend/src/App.css`
- [X] T027 [US3] Verify no deployment behavior changes are required in `railway.json` and `nixpacks.toml`

**Checkpoint**: All user stories are independently functional and integrated without product regressions.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, cleanup, and documentation alignment across all stories.

- [X] T028 [P] Review `specs/005-add-agpl-license/quickstart.md` and update any validation steps that changed during implementation
- [X] T029 [P] Review `specs/005-add-agpl-license/contracts/ui.md` against implemented SourceLink behavior and update if necessary
- [X] T030 Run backend pytest coverage from `backend/` with `uv run pytest`
- [X] T031 Run backend Ruff lint from `backend/` with `uv run ruff check src tests`
- [X] T032 Run frontend lint from `frontend/` with `npm run lint`
- [X] T033 Run frontend typecheck from `frontend/` with `npm run typecheck`
- [X] T034 Run frontend coverage from `frontend/` with `npm run test:coverage`
- [X] T035 Run frontend Playwright tests from `frontend/` with `npm run test:e2e`
- [X] T036 Run frontend build from `frontend/` with `npm run build`
- [X] T037 Check final repository status and ensure no generated coverage/build artifacts are staged in `.gitignore`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories because tests define license and SourceLink acceptance.
- **User Story 1 (Phase 3)**: Depends on Foundational; delivers MVP license discoverability and metadata consistency.
- **User Story 2 (Phase 4)**: Depends on Foundational; can start after SourceLink tests exist and uses shared support-link constants from Setup.
- **User Story 3 (Phase 5)**: Depends on US2 because it validates the integrated app after SourceLink exists.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2; no dependency on SourceLink implementation.
- **US2 (P2)**: Can start after Phase 2; independent from US1 except for shared SPDX/license constants.
- **US3 (P3)**: Requires US2 integration because it validates no regressions after SourceLink is present.

### Within Each User Story

- Write tests first and confirm they fail before implementation.
- Add metadata and SPDX declarations before final license consistency validation.
- Add SourceLink component before App integration and CSS positioning.
- Complete each story's independent test before moving to the next priority.

### Parallel Opportunities

- T002 and T003 can run in parallel after T001.
- T004 and T005 both edit `tests/scripts/test_license_metadata.py`, so coordinate if parallelized; T006 can run independently.
- US1 tests T007 and T008 can be written in parallel.
- US1 implementation tasks T010, T011, and T012 can run in parallel after T009.
- SPDX header batches T013, T014, and T015 can run in parallel because they touch separate directory trees.
- US2 tests T016, T017, and T018 can run in parallel.
- US3 tests T023, T024, and T025 can run in parallel.
- Polish documentation checks T028 and T029 can run in parallel.

---

## Parallel Example: User Story 1

```bash
Task: "Add a test that verifies the root LICENSE contains AGPL v3 text and Copyright (C) 2026 Nephorion in tests/scripts/test_license_metadata.py"
Task: "Add AGPL-3.0-only badge and license link near the top of README.md"
Task: "Add [project] license = \"AGPL-3.0-only\" in backend/pyproject.toml"
Task: "Add license field with AGPL-3.0-only in frontend/package.json"
```

## Parallel Example: User Story 2

```bash
Task: "Add SourceLink render, href, target, rel, and accessible-name tests in frontend/src/components/SourceLink.test.tsx"
Task: "Add Playwright desktop and mobile assertions for the Source link in frontend/tests/ui/support-links.spec.ts"
Task: "Implement stateless SourceLink component using SOURCE_REPOSITORY_URL and SOURCE_LINK_LABELS in frontend/src/components/SourceLink.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Extend App tests to prove existing support/version controls remain present after adding SourceLink in frontend/src/App.test.tsx"
Task: "Extend Playwright map smoke tests to prove controls remain reachable on desktop and mobile in frontend/tests/ui/map-ui.spec.ts"
Task: "Add a test proving SourceLink does not emit or require analytics events in frontend/src/services/analytics.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational tests.
3. Complete Phase 3 to add AGPL v3 LICENSE, metadata declarations, README badge, and SPDX headers.
4. Stop and validate US1 independently with `uv run pytest ../tests/scripts/test_license_metadata.py` from `backend/`.

### Incremental Delivery

1. Deliver US1 to make the repository license clear and tooling-detectable.
2. Deliver US2 to satisfy AGPL §13 for hosted network users with an in-app Source link.
3. Deliver US3 to prove existing product behavior remains unchanged.
4. Complete polish validation commands from `quickstart.md`.

### Quality Gates

1. Run `uv run pytest` from `backend/`.
2. Run `uv run ruff check src tests` from `backend/`.
3. Run `npm run lint` from `frontend/`.
4. Run `npm run typecheck` from `frontend/`.
5. Run `npm run test:coverage` from `frontend/`.
6. Run `npm run test:e2e` from `frontend/`.
7. Run `npm run build` from `frontend/`.

---

## Notes

- All task descriptions include repository paths or path patterns needed for implementation.
- `[P]` tasks touch separate files or independent test/docs surfaces and can be parallelized safely.
- Tests are intentionally included to satisfy the project constitution and maintain 100% coverage.
- No new production dependency is required.
