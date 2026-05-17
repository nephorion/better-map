# Tasks: Analytics, Donations, Nephorion Link, and Version Hash Fix

**Input**: Design documents from `specs/003-next-feature-adding/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui.md`, `quickstart.md`

**Tests**: Automated tests are required by the project constitution and quickstart. Write test tasks before implementation tasks for each user story.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the active feature context and existing quality tooling before story work starts.

- [X] T001 Confirm `AGENTS.md` points to `specs/003-next-feature-adding/plan.md`
- [X] T002 Confirm frontend scripts in `frontend/package.json` include `lint`, `typecheck`, `test:coverage`, `build`, and `test:e2e`
- [X] T003 Confirm backend quality configuration in `backend/pyproject.toml` includes Ruff, mypy strict mode, pytest, and `--cov-fail-under=100`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add shared constants and layout affordances needed by multiple user stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 [P] Create support destination constants for Ko-fi and Nephorion in `frontend/src/services/supportLinks.ts`
- [X] T005 [P] Create tests for support destination constants in `frontend/src/services/supportLinks.test.ts`
- [X] T006 Add shared overlay placement styles for subtle support controls and panes in `frontend/src/App.css`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Understand Site Usage (Priority: P1) MVP

**Goal**: Record default page-view analytics for `G-PZ4DB72GNK` without custom callsign, map, donation, or external-link events and without blocking map use.

**Independent Test**: Open the app in a browser session that allows analytics and verify the Google Analytics page-view configuration loads; simulate analytics failure and verify the map remains usable without visible analytics errors.

### Tests for User Story 1

- [X] T007 [P] [US1] Add analytics service tests for measurement ID, default page-view scope, and no custom events in `frontend/src/services/analytics.test.ts`
- [X] T008 [P] [US1] Add app integration test proving analytics load failure does not show a user-visible error in `frontend/src/App.test.tsx`

### Implementation for User Story 1

- [X] T009 [US1] Implement Google Analytics script/page-view helper with measurement ID `G-PZ4DB72GNK` in `frontend/src/services/analytics.ts`
- [X] T010 [US1] Invoke analytics initialization on app startup without blocking rendering in `frontend/src/main.tsx`
- [X] T011 [US1] Update app startup tests to cover analytics initialization and blocked-script behavior in `frontend/src/App.test.tsx`

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - Offer a Subtle Donation Path (Priority: P2)

**Goal**: Provide a custom subtle Better Map donation button that opens a dismissible in-page Ko-fi pane for `https://ko-fi.com/museofnephorion` while preserving map state.

**Independent Test**: Load the main page, identify the custom donation button, open the in-page Ko-fi pane, dismiss it, and confirm callsign, base map, and current map state are preserved.

### Tests for User Story 2

- [X] T012 [P] [US2] Add donation pane component tests for open, dismiss, fallback, and accessible labels in `frontend/src/components/DonationPane.test.tsx`
- [X] T013 [P] [US2] Add donation control integration tests for map-state preservation in `frontend/src/App.test.tsx`
- [X] T014 [P] [US2] Add Playwright test for desktop and mobile donation control placement in `frontend/tests/ui/support-links.spec.ts`

### Implementation for User Story 2

- [X] T015 [US2] Implement the custom subtle donation button and in-page Ko-fi pane in `frontend/src/components/DonationPane.tsx`
- [X] T016 [US2] Integrate `DonationPane` state and rendering into the map shell in `frontend/src/App.tsx`
- [X] T017 [US2] Style the custom donation button and pane as secondary overlay UI in `frontend/src/App.css`
- [X] T018 [US2] Add Ko-fi load failure or fallback handling for `https://ko-fi.com/museofnephorion` in `frontend/src/components/DonationPane.tsx`

**Checkpoint**: User Story 2 is fully functional and independently testable.

---

## Phase 5: User Story 4 - Verify Deployed Version (Priority: P2)

**Goal**: Make Railway deployments show the actual short commit hash instead of `dev` while preserving local fallback and mismatch warnings.

**Independent Test**: Simulate Railway commit metadata and confirm the frontend visible version and backend `/api/version` return the short deployed hash; simulate missing metadata and confirm local `dev` fallback remains non-blocking.

### Tests for User Story 4

- [X] T019 [P] [US4] Add frontend version metadata tests for explicit version, Railway metadata, Git fallback, and `dev` fallback in `frontend/src/services/versionMetadata.test.ts`
- [X] T020 [P] [US4] Add Vite config version resolution tests for Railway metadata precedence in `frontend/vite.config.test.ts`
- [X] T021 [P] [US4] Add backend version endpoint tests for `BETTER_MAP_VERSION`, `RAILWAY_GIT_COMMIT_SHA`, Git fallback, and `dev` fallback in `backend/tests/contract/test_version_api.py`
- [X] T022 [P] [US4] Add app mismatch warning regression test in `frontend/src/App.test.tsx`

### Implementation for User Story 4

- [X] T023 [US4] Extract shared frontend build version resolution from `frontend/vite.config.ts` into `frontend/version.ts`
- [X] T024 [US4] Update `frontend/vite.config.ts` to define `__APP_VERSION__` from explicit version, Railway commit metadata, Git, then `dev`
- [X] T025 [US4] Update frontend metadata handling in `frontend/src/services/versionMetadata.ts` to preserve mismatch warnings and non-blocking fallback states
- [X] T026 [US4] Update backend hash resolution in `backend/src/better_map/api/app.py` to use `BETTER_MAP_VERSION`, Railway commit metadata, Git, then `dev`
- [X] T027 [US4] Update version display and status regression coverage in `frontend/src/App.test.tsx`

**Checkpoint**: User Story 4 is fully functional and independently testable.

---

## Phase 6: User Story 3 - Discover the Nephorion Main Site (Priority: P3)

**Goal**: Provide a subtle external Nephorion link to `https://nephorion.com` that opens in a new tab/window and preserves the active Better Map page.

**Independent Test**: Load the main page, find the subtle Nephorion link, activate it, and confirm it opens `https://nephorion.com` in a new tab/window without replacing Better Map.

### Tests for User Story 3

- [X] T028 [P] [US3] Add Nephorion link component tests for URL, new-tab target, rel attributes, and accessible label in `frontend/src/components/NephorionLink.test.tsx`
- [X] T029 [P] [US3] Add Playwright test for desktop and mobile Nephorion link placement in `frontend/tests/ui/support-links.spec.ts`

### Implementation for User Story 3

- [X] T030 [US3] Implement subtle Nephorion external link component in `frontend/src/components/NephorionLink.tsx`
- [X] T031 [US3] Integrate `NephorionLink` into the map shell in `frontend/src/App.tsx`
- [X] T032 [US3] Style the Nephorion link as secondary support UI in `frontend/src/App.css`

**Checkpoint**: User Story 3 is fully functional and independently testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete feature set and update supporting documentation.

- [X] T033 [P] Update feature quickstart notes if implementation details differ in `specs/003-next-feature-adding/quickstart.md`
- [X] T034 Run frontend lint in `frontend/` with `npm run lint`
- [X] T035 Run frontend typecheck in `frontend/` with `npm run typecheck`
- [X] T036 Run frontend coverage tests in `frontend/` with `npm run test:coverage`
- [X] T037 Run frontend build in `frontend/` with `npm run build`
- [X] T038 Run frontend Playwright tests in `frontend/` with `npm run test:e2e`
- [X] T039 Run backend Ruff in `backend/` with `uv run ruff check .`
- [X] T040 Run backend mypy in `backend/` with `uv run mypy .`
- [X] T041 Run backend pytest in `backend/` with `uv run pytest`
- [ ] T042 Perform Railway smoke-check instructions from `specs/003-next-feature-adding/quickstart.md` after deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks user story implementation.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
- **Polish (Phase 7)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational; no dependency on other stories; suggested MVP.
- **User Story 2 (P2)**: Can start after Foundational; uses shared support constants from Phase 2 only.
- **User Story 4 (P2)**: Can start after Foundational; independent from support-link stories.
- **User Story 3 (P3)**: Can start after Foundational; uses shared support constants from Phase 2 only.

### Within Each User Story

- Tests must be written before implementation tasks.
- Services/helpers before component integration.
- Component implementation before app-shell integration.
- Story checkpoint validation before moving to the next priority if working sequentially.

### Parallel Opportunities

- T004 and T005 can run in parallel after Setup.
- US1 tests T007 and T008 can run in parallel.
- US2 tests T012, T013, and T014 can run in parallel.
- US4 tests T019, T020, T021, and T022 can run in parallel.
- US3 tests T028 and T029 can run in parallel.
- US2, US4, and US3 can be implemented in parallel after Phase 2 if different contributors avoid conflicting edits to `frontend/src/App.tsx` and `frontend/src/App.css`.

---

## Parallel Example: User Story 2

```bash
Task: "Add donation pane component tests for open, dismiss, fallback, and accessible labels in frontend/src/components/DonationPane.test.tsx"
Task: "Add donation control integration tests for map-state preservation in frontend/src/App.test.tsx"
Task: "Add Playwright test for desktop and mobile donation control placement in frontend/tests/ui/support-links.spec.ts"
```

## Parallel Example: User Story 4

```bash
Task: "Add frontend version metadata tests for explicit version, Railway metadata, Git fallback, and dev fallback in frontend/src/services/versionMetadata.test.ts"
Task: "Add Vite config version resolution tests for Railway metadata precedence in frontend/vite.config.test.ts"
Task: "Add backend version endpoint tests for BETTER_MAP_VERSION, RAILWAY_GIT_COMMIT_SHA, Git fallback, and dev fallback in backend/tests/api/test_version.py"
Task: "Add app mismatch warning regression test in frontend/src/App.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate analytics loading and analytics-failure behavior independently.

### Incremental Delivery

1. Add User Story 1 for default Google Analytics page views.
2. Add User Story 2 for the Ko-fi donation pane.
3. Add User Story 4 for Railway version hash correctness.
4. Add User Story 3 for the Nephorion link.
5. Complete polish and full quickstart validation.

### Notes

- Keep analytics page-view-only; do not add custom event tracking.
- Keep the Ko-fi entry point custom and subtle; do not use Ko-fi's default floating button.
- Preserve the existing frontend/backend mismatch warning as non-blocking.
- Do not remove local `dev` fallback when commit metadata is unavailable.
