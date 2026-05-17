# Tasks: Full-Window WSPR Map Experience

**Input**: Design documents from `specs/002-deckgl-map-ui/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui.md`, `quickstart.md`

**Tests**: Test tasks are included because the project constitution requires automated tests and 100% code coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add required frontend dependencies and test support before feature work begins.

- [X] T001 Add deck.gl dependencies to `frontend/package.json` and update `frontend/package-lock.json` using npm install
- [X] T002 [P] Add map test mocks for MapLibre and deck.gl rendering boundaries in `frontend/src/test/setup.ts`
- [X] T003 [P] Add localStorage test helpers for callsign persistence scenarios in `frontend/src/test/storageTestUtils.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared frontend services, map configuration, and layout foundations that all stories depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 [P] Add tests for callsign localStorage read/write/invalid-value/session-only failure handling in `frontend/src/services/callsign.test.ts`
- [X] T005 [P] Add tests for OpenStreetMap Standard, OpenTopoMap, and OpenStreetMap Humanitarian catalog validation in `frontend/src/services/baseMapLayers.test.ts`
- [X] T006 [P] Add tests for refresh countdown state transitions in `frontend/src/services/refreshState.test.ts`
- [X] T007 Implement callsign localStorage persistence helpers in `frontend/src/services/callsign.ts`
- [X] T008 Implement OpenStreetMap Standard, OpenTopoMap, and OpenStreetMap Humanitarian catalog with attribution and usage metadata in `frontend/src/services/baseMapLayers.ts`
- [X] T009 Implement refresh countdown state helpers in `frontend/src/services/refreshState.ts`
- [X] T010 Replace framed app shell CSS with full-window map layout primitives in `frontend/src/App.css`
- [X] T011 Update global page sizing and overflow rules for full-window map rendering in `frontend/src/index.css`
- [X] T012 Refactor WSPR path conversion to preserve all feature properties for details display in `frontend/src/services/mapFeatures.ts`

**Checkpoint**: Foundation ready. User story implementation can now begin.

---

## Phase 3: User Story 1 - Start With Saved Callsign Context (Priority: P1) MVP

**Goal**: Prompt first-time users for a callsign, persist valid callsigns in localStorage, and use the active callsign for all activity queries.

**Independent Test**: Visit with no saved callsign, enter a valid callsign, confirm data loads for it, reload with saved callsign, and confirm setup is bypassed.

### Tests for User Story 1

- [X] T013 [P] [US1] Add first-run callsign prompt tests in `frontend/src/App.test.tsx`
- [X] T014 [P] [US1] Add returning-user localStorage bypass tests in `frontend/src/App.test.tsx`
- [X] T015 [P] [US1] Add invalid saved callsign recovery tests in `frontend/src/App.test.tsx`
- [X] T016 [P] [US1] Add callsign prompt component interaction tests in `frontend/src/components/CallsignPrompt.test.tsx`

### Implementation for User Story 1

- [X] T017 [US1] Create callsign prompt component with validation and dismiss handling in `frontend/src/components/CallsignPrompt.tsx`
- [X] T018 [US1] Replace initial search-panel flow with active callsign state and startup localStorage load in `frontend/src/App.tsx`
- [X] T019 [US1] Persist confirmed callsigns to localStorage and normalize active callsign before querying in `frontend/src/App.tsx`
- [X] T020 [US1] Add persistent Set Callsign overlay behavior when no valid callsign is active in `frontend/src/App.tsx`
- [X] T021 [US1] Update callsign prompt and overlay styling in `frontend/src/App.css`

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Use a Full-Window Map With Overlay Controls (Priority: P1)

**Goal**: Make the map fill the browser window, render selectable WSPR paths through deck.gl, remove the persistent contact list, and expose callsign controls as overlays.

**Independent Test**: Open the site on desktop and mobile-sized viewports and confirm the map fills the window, path rendering uses deck.gl, and no persistent contact list is present.

### Tests for User Story 2

- [X] T022 [P] [US2] Add full-window layout, stacked mobile overlay, and no-contact-list tests in `frontend/src/App.test.tsx`
- [X] T023 [P] [US2] Add deck.gl path rendering tests in `frontend/src/components/WsprMap.test.tsx`
- [X] T024 [P] [US2] Add active callsign overlay click-to-edit tests in `frontend/src/components/CallsignOverlay.test.tsx`

### Implementation for User Story 2

- [X] T025 [US2] Create active callsign overlay component in `frontend/src/components/CallsignOverlay.tsx`
- [X] T026 [US2] Refactor `frontend/src/components/WsprMap.tsx` to render WSPR paths with deck.gl overlay layers instead of MapLibre line layers
- [X] T027 [US2] Remove persistent path-list/contact-list rendering from `frontend/src/components/WsprMap.tsx`
- [X] T028 [US2] Wire callsign overlay click behavior to reopen callsign selection in `frontend/src/App.tsx`
- [X] T029 [US2] Style full-window map canvas and overlay stacking in `frontend/src/App.css`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Change Base Map Layer (Priority: P2)

**Goal**: Let users switch between suitable open base map layers without losing callsign context, paths, countdown, or selected details.

**Independent Test**: Open the base map selector, choose multiple open layers, and confirm the map background changes while WSPR overlays and context remain intact.

### Tests for User Story 3

- [X] T030 [P] [US3] Add base map selector component tests for OpenStreetMap Standard, OpenTopoMap, and OpenStreetMap Humanitarian in `frontend/src/components/BaseMapSelector.test.tsx`
- [X] T031 [P] [US3] Add base map change preservation tests in `frontend/src/components/WsprMap.test.tsx`

### Implementation for User Story 3

- [X] T032 [US3] Create base map selector overlay component in `frontend/src/components/BaseMapSelector.tsx`
- [X] T033 [US3] Add active base map layer state and selector wiring in `frontend/src/App.tsx`
- [X] T034 [US3] Update MapLibre style switching to use selected open base map layer in `frontend/src/components/WsprMap.tsx`
- [X] T035 [US3] Render active base map attribution access in `frontend/src/components/BaseMapSelector.tsx`
- [X] T036 [US3] Add base map selector styling and mobile placement in `frontend/src/App.css`

**Checkpoint**: User Story 3 works without regressing User Stories 1 and 2.

---

## Phase 6: User Story 4 - Keep Map Data Current (Priority: P2)

**Goal**: Refresh active callsign data every five minutes after refresh completion/failure, show a countdown, and allow manual refresh without duplicate overlapping requests.

**Independent Test**: Load map data, observe countdown, click it to force refresh, simulate failure, and confirm previous successful data remains visible and the countdown reschedules.

### Tests for User Story 4

- [X] T037 [P] [US4] Add compact top-right mm:ss countdown control tests in `frontend/src/components/RefreshCountdown.test.tsx`
- [X] T038 [P] [US4] Add automatic/manual refresh flow tests in `frontend/src/App.test.tsx`
- [X] T039 [P] [US4] Add refresh failure preservation tests in `frontend/src/App.test.tsx`

### Implementation for User Story 4

- [X] T040 [US4] Create compact top-right mm:ss countdown/manual refresh overlay component in `frontend/src/components/RefreshCountdown.tsx`
- [X] T041 [US4] Add five-minute refresh scheduling and cleanup logic in `frontend/src/App.tsx`
- [X] T042 [US4] Prevent overlapping active-callsign refresh requests in `frontend/src/App.tsx`
- [X] T043 [US4] Preserve previous successful result and show non-destructive refresh errors in `frontend/src/App.tsx`
- [X] T044 [US4] Style countdown overlay and refresh error status in `frontend/src/App.css`

**Checkpoint**: User Story 4 works without regressing earlier stories.

---

## Phase 7: User Story 5 - Inspect Contact Details From the Map (Priority: P2)

**Goal**: Selecting a visible deck.gl contact path opens an overlay details panel with all WSPRNET/WSPR API payload fields, and stale selected contacts close after refresh.

**Independent Test**: Click a visible path, confirm all WSPRNET/WSPR API payload fields appear, select another path, close the panel, and confirm the panel closes when refreshed results omit the selected contact.

### Tests for User Story 5

- [X] T045 [P] [US5] Add all WSPRNET/WSPR API payload fields contact details tests in `frontend/src/components/ActivityDetails.test.tsx`
- [X] T046 [P] [US5] Add deck.gl pointer and keyboard path selection tests in `frontend/src/components/WsprMap.test.tsx`
- [X] T047 [P] [US5] Add stale selected-contact close tests in `frontend/src/components/WsprMap.test.tsx`

### Implementation for User Story 5

- [X] T048 [US5] Update contact details panel to render all WSPRNET/WSPR API payload fields for the selected contact in `frontend/src/components/ActivityDetails.tsx`
- [X] T049 [US5] Wire deck.gl path pointer and keyboard selection to selected contact state in `frontend/src/components/WsprMap.tsx`
- [X] T050 [US5] Clear selected contact when refreshed features omit the selected contact id in `frontend/src/components/WsprMap.tsx`
- [X] T051 [US5] Style contact details overlay for desktop and mobile map use in `frontend/src/App.css`

**Checkpoint**: All user stories are independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, documentation alignment, and quality gates across all stories.

- [X] T052 [P] Update manual verification notes for the deck.gl map flow in `specs/002-deckgl-map-ui/quickstart.md`
- [X] T053 [P] Review UI contract coverage against implemented tests in `specs/002-deckgl-map-ui/contracts/ui.md`
- [X] T054 [P] Add frontend generated version metadata tests in `frontend/src/services/versionMetadata.test.ts`
- [X] T055 [P] Add backend version endpoint contract tests in `backend/tests/contract/test_version_api.py`
- [X] T056 [P] Add version indicator display and mismatch tests in `frontend/src/App.test.tsx`
- [X] T057 Generate frontend version metadata from the current short git hash in `frontend/vite.config.ts`
- [X] T058 Implement frontend version metadata reader in `frontend/src/services/versionMetadata.ts`
- [X] T059 Implement backend short version hash response in `backend/src/better_map/api/app.py`
- [X] T060 Implement version hash comparison and mismatch error state in `frontend/src/App.tsx`
- [X] T061 Style small low-opacity monospace version hash indicator with attribution-priority placement in `frontend/src/App.css`
- [X] T062 Run frontend quality gates with `npm run lint`, `npm run typecheck`, `npm run test:coverage`, and `npm run build` from `frontend/`
- [X] T063 Run backend quality gates with `uv run ruff check .`, `uv run mypy src tests`, and `uv run pytest --cov=src --cov-fail-under=100` from `backend/`
- [X] T064 Run script quality gate with `uv run pytest ../tests/scripts --cov=../tests/scripts --cov-fail-under=100` from `backend/`
- [X] T065 Validate quickstart manual flow from `specs/002-deckgl-map-ui/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion and is the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational completion; should be integrated after US1 for the main MVP experience.
- **User Stories 3-5 (Phases 5-7)**: Depend on Foundational completion and can proceed after US2 map structure exists.
- **Polish (Phase 8)**: Depends on all targeted user stories being complete.

### User Story Dependencies

- **US1 Start With Saved Callsign Context**: No dependencies after foundation.
- **US2 Full-Window Map With Overlay Controls**: Integrates with US1 callsign state but remains testable with provided props/mocks.
- **US3 Change Base Map Layer**: Depends on US2 map shell for final integration.
- **US4 Keep Map Data Current**: Depends on US1 active callsign state for final integration.
- **US5 Inspect Contact Details From the Map**: Depends on US2 deck.gl path rendering for final integration.

### Within Each User Story

- Write story tests first and confirm they fail.
- Implement service/model helpers before component integration.
- Implement components before app-level wiring when possible.
- Complete styling after behavior is implemented.
- Validate the story independently before moving to the next phase.

---

## Parallel Execution Examples

### User Story 1

```bash
Task: "Add first-run callsign prompt tests in frontend/src/App.test.tsx"
Task: "Add callsign prompt component interaction tests in frontend/src/components/CallsignPrompt.test.tsx"
```

### User Story 2

```bash
Task: "Add deck.gl path rendering tests in frontend/src/components/WsprMap.test.tsx"
Task: "Add active callsign overlay click-to-edit tests in frontend/src/components/CallsignOverlay.test.tsx"
```

### User Story 3

```bash
Task: "Add base map selector component tests in frontend/src/components/BaseMapSelector.test.tsx"
Task: "Add base map change preservation tests in frontend/src/components/WsprMap.test.tsx"
```

### User Story 4

```bash
Task: "Add countdown control tests in frontend/src/components/RefreshCountdown.test.tsx"
Task: "Add automatic/manual refresh flow tests in frontend/src/App.test.tsx"
```

### User Story 5

```bash
Task: "Add all-fields contact details tests in frontend/src/components/ActivityDetails.test.tsx"
Task: "Add deck.gl path selection tests in frontend/src/components/WsprMap.test.tsx"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Complete Phase 4: User Story 2.
5. Stop and validate first-run callsign, returning-user localStorage, full-window map, deck.gl paths, and no persistent contact list.

### Incremental Delivery

1. Add US1 for callsign setup and persistence.
2. Add US2 for the map-first deck.gl experience.
3. Add US3 for base map switching.
4. Add US4 for automatic/manual refresh.
5. Add US5 for map-based contact details.
6. Add version hash metadata, backend comparison, and mismatch handling.
7. Run final quality gates and quickstart verification.

### Parallel Team Strategy

1. Complete Setup and Foundational phases together.
2. Implement US1 and US2 sequentially for MVP alignment.
3. Split US3, US4, and US5 across separate contributors after US2 map shell is stable.
4. Rejoin for cross-story polish and full quality gates.
