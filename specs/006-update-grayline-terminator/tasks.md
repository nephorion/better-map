# Tasks: Update Grayline Terminator

**Input**: Design documents from `specs/006-update-grayline-terminator/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui.md`, `quickstart.md`

**Tests**: Tests are included because the project constitution requires automated tests and 100% code coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files or has no dependency on incomplete tasks
- **[Story]**: Maps to the user story from `spec.md`
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the frontend test and source structure for terminator work.

- [X] T001 Create the terminator service module scaffold with exported placeholder types in `frontend/src/services/terminator.ts`
- [X] T002 [P] Create the terminator service test file scaffold in `frontend/src/services/terminator.test.ts`
- [X] T003 [P] Extend deck.gl layer test mocks to support the planned grayline overlay layer in `frontend/src/test/setup.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared terminology, constants, and test utilities required by all stories.

**Critical**: No user story work should begin until this phase is complete.

- [X] T004 Define shared terminator constants, interval value, coordinate types, and overlay data types in `frontend/src/services/terminator.ts`
- [X] T005 [P] Add shared WsprMap test helpers for loading the mocked map and reading deck layers in `frontend/src/components/WsprMap.test.tsx`

**Checkpoint**: Foundation ready; user story implementation can begin.

---

## Phase 3: User Story 1 - See Grayline Movement Over Time (Priority: P1) MVP

**Goal**: Show a subtle current grayline/day-night terminator on the WSPR map and make it capable of advancing from a refreshed observation time.

**Independent Test**: Open the map, verify a grayline overlay layer is present behind WSPR paths, and verify fixed-time terminator calculations produce valid current geometry.

### Tests for User Story 1

- [X] T006 [P] [US1] Add fixed-time tests for current terminator geometry, coordinate ranges, high-latitude handling, and date-line continuity in `frontend/src/services/terminator.test.ts`
- [X] T007 [P] [US1] Add a WsprMap component test proving the grayline overlay layer renders behind the WSPR path layer in `frontend/src/components/WsprMap.test.tsx`
- [X] T008 [P] [US1] Add Playwright UI smoke assertions that desktop and mobile-sized maps remain visible with the grayline overlay present in `frontend/tests/ui/map-ui.spec.ts`

### Implementation for User Story 1

- [X] T009 [US1] Implement deterministic current terminator geometry generation in `frontend/src/services/terminator.ts`
- [X] T010 [US1] Add grayline overlay state initialization and current observation-time data generation in `frontend/src/components/WsprMap.tsx`
- [X] T011 [US1] Render the grayline/day-night overlay behind WSPR paths in the existing deck overlay in `frontend/src/components/WsprMap.tsx`
- [X] T012 [US1] Ensure grayline layer styling remains visually subordinate to WSPR path colors, controls, labels, and attribution in `frontend/src/components/WsprMap.tsx`

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Preserve Map Usability During Updates (Priority: P2)

**Goal**: Refresh the grayline every 5 minutes while visible without interrupting map navigation, callsign lookup, WSPR data, selected base map, or controls.

**Independent Test**: Use fake timers to trigger a scheduled refresh and verify the overlay updates while existing map state and WSPR paths remain unchanged.

### Tests for User Story 2

- [X] T013 [P] [US2] Add terminator service tests proving a new observation time changes refresh output without mutating previous overlay data in `frontend/src/services/terminator.test.ts`
- [X] T014 [P] [US2] Add WsprMap fake-timer test proving grayline refresh runs every 5 minutes while preserving map view, zoom, selected WSPR path details, and open controls in `frontend/src/components/WsprMap.test.tsx`
- [X] T015 [P] [US2] Add WsprMap test proving scheduled grayline refresh does not reset base-map style, active callsign rendering, support links, analytics behavior, refresh controls, or version status in `frontend/src/components/WsprMap.test.tsx`

### Implementation for User Story 2

- [X] T016 [US2] Implement visible-session 5-minute grayline refresh scheduling in `frontend/src/components/WsprMap.tsx`
- [X] T017 [US2] Update deck overlay props so scheduled refresh replaces only the grayline layer data and preserves WSPR path layer behavior in `frontend/src/components/WsprMap.tsx`
- [X] T018 [US2] Add cleanup for grayline refresh timers on map unmount in `frontend/src/components/WsprMap.tsx`
- [X] T019 [US2] Harden refresh failure handling so failed grayline updates preserve the existing map and previous overlay, avoid disruptive errors, and retry on each later scheduled or visibility-return refresh in `frontend/src/components/WsprMap.tsx`

**Checkpoint**: User Stories 1 and 2 work independently and together.

---

## Phase 5: User Story 3 - Recover From Long-Running Session Changes (Priority: P3)

**Goal**: Refresh immediately when a hidden/backgrounded map session becomes visible again and catch up after inactivity or device clock changes.

**Independent Test**: Simulate visibility changes and clock changes, then verify the grayline refreshes immediately on return without waiting for the next scheduled interval.

### Tests for User Story 3

- [X] T020 [P] [US3] Add WsprMap visibility-change test proving hidden sessions request refresh within 1 second when visible again after at least 5 minutes in `frontend/src/components/WsprMap.test.tsx`
- [X] T021 [P] [US3] Add WsprMap visibility-change test proving visibility-return refresh uses current device time after clock changes in `frontend/src/components/WsprMap.test.tsx`
- [X] T022 [P] [US3] Add Playwright desktop and mobile UI smoke coverage that controls, support links, version status, and WSPR refresh remain usable after simulated visibility return in `frontend/tests/ui/map-ui.spec.ts`

### Implementation for User Story 3

- [X] T023 [US3] Implement document visibility handling for hidden/backgrounded grayline sessions in `frontend/src/components/WsprMap.tsx`
- [X] T024 [US3] Request grayline refresh within 1 second on stale visibility return before waiting for the next scheduled interval in `frontend/src/components/WsprMap.tsx`
- [X] T025 [US3] Reset the visible-session refresh schedule after visibility-return refresh in `frontend/src/components/WsprMap.tsx`
- [X] T026 [US3] Remove visibility event listeners during WsprMap unmount cleanup in `frontend/src/components/WsprMap.tsx`

**Checkpoint**: All user stories are independently functional and integrated.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, cleanup, and documentation alignment across all stories.

- [X] T027 [P] Update the implementation checklist and manual smoke notes if behavior changed during implementation in `specs/006-update-grayline-terminator/quickstart.md`
- [X] T028 [P] Verify UI contract acceptance scenarios remain aligned with implemented behavior in `specs/006-update-grayline-terminator/contracts/ui.md`
- [X] T029 Run frontend lint and fix any issues in `frontend/src/services/terminator.ts` and `frontend/src/components/WsprMap.tsx`
- [X] T030 Run frontend typecheck and fix any type issues in `frontend/src/services/terminator.ts` and `frontend/src/components/WsprMap.tsx`
- [X] T031 Run frontend coverage tests and fix any coverage gaps in `frontend/src/services/terminator.test.ts` and `frontend/src/components/WsprMap.test.tsx`
- [X] T032 Run frontend Playwright tests and fix any UI regressions in `frontend/tests/ui/map-ui.spec.ts`
- [X] T033 Run frontend build and fix any build issues in `frontend/src/services/terminator.ts` and `frontend/src/components/WsprMap.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational; delivers MVP grayline display.
- **User Story 2 (Phase 4)**: Depends on Foundational and integrates with US1 rendering; preserves usability during scheduled refreshes.
- **User Story 3 (Phase 5)**: Depends on Foundational and scheduled refresh behavior from US2; adds visibility-return recovery.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2; no dependency on other user stories.
- **US2 (P2)**: Can start after Phase 2 but should integrate on top of US1 for complete user value.
- **US3 (P3)**: Can start after Phase 2 but is simplest after US2 scheduling exists.

### Within Each User Story

- Write tests first and confirm they fail before implementation.
- Implement service logic before component integration where both are needed.
- Complete component behavior before Playwright validation.
- Validate the story independently before moving to the next priority.

### Parallel Opportunities

- T002 and T003 can run in parallel after T001 is started.
- T005 can run in parallel with T004 after setup files exist.
- US1 tests T006, T007, and T008 can be written in parallel.
- US2 tests T013, T014, and T015 can be written in parallel.
- US3 tests T020, T021, and T022 can be written in parallel.
- Documentation checks T027 and T028 can run in parallel during polish.

---

## Parallel Example: User Story 1

```bash
Task: "Add fixed-time tests for current terminator geometry, coordinate ranges, high-latitude handling, and date-line continuity in frontend/src/services/terminator.test.ts"
Task: "Add a WsprMap component test proving the grayline overlay layer renders behind the WSPR path layer in frontend/src/components/WsprMap.test.tsx"
Task: "Add a Playwright UI smoke assertion that the map remains visible with the grayline overlay present in frontend/tests/ui/map-ui.spec.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Add terminator service tests proving a new observation time changes refresh output without mutating previous overlay data in frontend/src/services/terminator.test.ts"
Task: "Add WsprMap fake-timer test proving grayline refresh runs every 5 minutes while preserving map view and selected WSPR path state in frontend/src/components/WsprMap.test.tsx"
Task: "Add WsprMap test proving scheduled grayline refresh does not reset base-map style or active callsign rendering in frontend/src/components/WsprMap.test.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Add WsprMap visibility-change test proving hidden sessions refresh immediately when visible again after at least 5 minutes in frontend/src/components/WsprMap.test.tsx"
Task: "Add WsprMap visibility-change test proving visibility-return refresh uses current device time after clock changes in frontend/src/components/WsprMap.test.tsx"
Task: "Add Playwright UI smoke coverage that overlay controls remain usable after simulated visibility return in frontend/tests/ui/map-ui.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational types and test helpers.
3. Complete Phase 3 to display the current grayline overlay.
4. Stop and validate US1 independently with service, component, and UI smoke tests.

### Incremental Delivery

1. Deliver US1 to show the current grayline overlay.
2. Deliver US2 to refresh every 5 minutes while preserving map usability.
3. Deliver US3 to recover immediately after hidden/backgrounded sessions become visible.
4. Complete polish validation commands from `quickstart.md`.

### Quality Gates

1. Run `npm run lint` from `frontend/`.
2. Run `npm run typecheck` from `frontend/`.
3. Run `npm run test:coverage` from `frontend/`.
4. Run `npm run test:e2e` from `frontend/`.
5. Run `npm run build` from `frontend/`.

---

## Notes

- All task descriptions include exact paths for implementation.
- `[P]` tasks touch separate files or are test/documentation work that can be done without depending on unfinished implementation tasks.
- Tests are intentionally included to satisfy the project constitution and maintain 100% coverage.
- Avoid adding new production dependencies unless implementation proves the local deterministic calculation is insufficient.
