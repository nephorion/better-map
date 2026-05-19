# Tasks: Configuration Panel

**Input**: Design documents from `/specs/007-add-config-panel/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui.md, quickstart.md

**Tests**: Included because the feature specification defines mandatory user-scenario testing and the implementation plan requires unit, component, and Playwright coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files or has no dependency on incomplete tasks
- **[Story]**: User story label for tasks in user story phases only
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the new frontend service/component/test files required by the plan.

- [X] T001 Create user configuration service skeleton with exported types, option constants, default configuration, and TODO-free stubs in `frontend/src/services/userConfig.ts`
- [X] T002 [P] Create WSPR filtering service skeleton with exported filter function signatures in `frontend/src/services/wsprFilters.ts`
- [X] T003 [P] Create user configuration unit test scaffold covering defaults, storage, Maidenhead validation, and Mixed normalization in `frontend/src/services/userConfig.test.ts`
- [X] T004 [P] Create WSPR filtering unit test scaffold covering Mixed, single-band, multi-band, and unknown-band cases in `frontend/src/services/wsprFilters.test.ts`
- [X] T005 [P] Create configuration panel component skeleton with typed props for value, save, close, and first-run mode in `frontend/src/components/ConfigPanel.tsx`
- [X] T006 [P] Create configuration panel component test scaffold for opening, validation, selectors, and save behavior in `frontend/src/components/ConfigPanel.test.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared configuration and filtering logic that all user stories depend on.

**Critical**: No user story work should begin until this phase is complete.

- [X] T007 Implement amateur band and mode option lists, including Mixed and all required band/mode labels from FR-008 and FR-011, in `frontend/src/services/userConfig.ts`
- [X] T008 Implement User Configuration types, defaults, localStorage read/write, callsign persistence, and invalid stored value normalization in `frontend/src/services/userConfig.ts`
- [X] T009 Implement Maidenhead normalization and validation for empty, 4-character, and 6-character values in `frontend/src/services/userConfig.ts`
- [X] T010 Implement Mixed precedence normalization for band and mode selections in `frontend/src/services/userConfig.ts`
- [X] T011 Implement WSPR result band normalization and client-side band filtering rules in `frontend/src/services/wsprFilters.ts`
- [X] T012 [P] Add unit tests for defaults, localStorage persistence, callsign persistence, and invalid stored value normalization in `frontend/src/services/userConfig.test.ts`
- [X] T013 [P] Add unit tests for empty, valid 4-character, valid 6-character, invalid, lowercase, and whitespace Maidenhead values in `frontend/src/services/userConfig.test.ts`
- [X] T014 [P] Add unit tests for Mixed precedence in band and mode selections in `frontend/src/services/userConfig.test.ts`
- [X] T015 [P] Add unit tests for WSPR filtering with Mixed, one band, multiple bands, missing band, and unknown band values in `frontend/src/services/wsprFilters.test.ts`

**Checkpoint**: Shared services are ready and covered by deterministic unit tests.

---

## Phase 3: User Story 1 - Open And Complete Configuration (Priority: P1) MVP

**Goal**: A user can open the configuration window from the bottom-left cog or first-run prompt, save optional callsign and preferences, and continue without the old callsign-only blocker.

**Independent Test**: Load the map with no stored callsign, confirm the configuration panel appears instead of the old callsign prompt, save valid optional values, refresh, and confirm saved values are restored while general WSPR results can load without a callsign.

### Tests for User Story 1

- [X] T016 [P] [US1] Add ConfigPanel tests for dialog semantics, accessible labels, close action, save action, optional callsign, and restored saved values in `frontend/src/components/ConfigPanel.test.tsx`
- [X] T017 [P] [US1] Add WsprMap tests for first-run panel display, cog-open behavior, no-callsign general results, and preserved map state in `frontend/src/components/WsprMap.test.tsx`

### Implementation for User Story 1

- [X] T018 [US1] Implement ConfigPanel dialog layout, callsign field, save/close controls, and accessible labeling in `frontend/src/components/ConfigPanel.tsx`
- [X] T019 [US1] Wire ConfigPanel into WsprMap state so the bottom-left cog opens it and close does not discard previously saved configuration in `frontend/src/components/WsprMap.tsx`
- [X] T020 [US1] Replace the no-callsign callsign-only prompt with first-run ConfigPanel behavior in `frontend/src/components/WsprMap.tsx`
- [X] T021 [US1] Update WsprMap result loading so empty callsign fetches and displays general WSPR results instead of blocking the map in `frontend/src/components/WsprMap.tsx`
- [X] T022 [US1] Add cog button and base panel layout styling that keeps controls usable on desktop and mobile viewports in `frontend/src/App.css`

**Checkpoint**: User Story 1 is independently functional and testable as the MVP.

---

## Phase 4: User Story 2 - Set Operating Location (Priority: P1)

**Goal**: A user can save empty, 4-character, or 6-character Maidenhead grid locator values, while invalid non-empty values are rejected with clear guidance.

**Independent Test**: Open the configuration panel, save empty location, save valid 4-character Maidenhead grid, save valid 6-character Maidenhead grid, and confirm invalid values show the expected-format error and are not saved.

### Tests for User Story 2

- [X] T023 [P] [US2] Add ConfigPanel tests for empty, 4-character, 6-character, invalid Maidenhead, blocked save, and error message behavior in `frontend/src/components/ConfigPanel.test.tsx`
- [X] T024 [P] [US2] Add WsprMap tests proving saved Maidenhead values are restored through the panel without changing map position unexpectedly in `frontend/src/components/WsprMap.test.tsx`

### Implementation for User Story 2

- [X] T025 [US2] Add Maidenhead input, normalized display value, validation error text, and save-blocking behavior to ConfigPanel in `frontend/src/components/ConfigPanel.tsx`
- [X] T026 [US2] Connect ConfigPanel Maidenhead save and restore behavior to userConfig service in `frontend/src/components/WsprMap.tsx`

**Checkpoint**: User Story 2 is independently functional and testable.

---

## Phase 5: User Story 3 - Filter WSPR Results By Band (Priority: P2)

**Goal**: A user can select one or more bands to filter visible WSPR results, or select Mixed to show all bands.

**Independent Test**: Select one band, multiple bands, and Mixed, then verify visible WSPR paths include only matching bands when specific bands are selected and include all results when Mixed is selected.

### Tests for User Story 3

- [X] T027 [P] [US3] Add ConfigPanel tests for band selector options, multi-select behavior, and Mixed exclusivity in `frontend/src/components/ConfigPanel.test.tsx`
- [X] T028 [P] [US3] Add WsprMap tests for single-band filtering, multi-band filtering, Mixed unfiltered behavior, unknown-band exclusion, and empty-result messaging in `frontend/src/components/WsprMap.test.tsx`

### Implementation for User Story 3

- [X] T029 [US3] Add band selector UI with Mixed plus all standard amateur band options to ConfigPanel in `frontend/src/components/ConfigPanel.tsx`
- [X] T030 [US3] Apply wsprFilters output before WSPR path rendering and activity detail selection in `frontend/src/components/WsprMap.tsx`
- [X] T031 [US3] Add active band filter and no-matching-results messaging without affecting Mixed behavior in `frontend/src/components/WsprMap.tsx`
- [X] T032 [US3] Style band selector groups and empty-result messaging for desktop and mobile usability in `frontend/src/App.css`

**Checkpoint**: User Story 3 is independently functional and testable.

---

## Phase 6: User Story 4 - Select Modes For Future Filtering (Priority: P3)

**Goal**: A user can select one or more mode preferences or Mixed, and saved mode choices do not filter current WSPRnet results.

**Independent Test**: Select one mode, multiple modes, and Mixed, save and reload configuration, then verify WSPR results are still filtered only by band settings.

### Tests for User Story 4

- [X] T033 [P] [US4] Add ConfigPanel tests for mode selector options, multi-select behavior, Mixed exclusivity, persistence, and restored values in `frontend/src/components/ConfigPanel.test.tsx`
- [X] T034 [P] [US4] Add WsprMap tests proving non-WSPR mode selections do not hide current WSPR results in `frontend/src/components/WsprMap.test.tsx`

### Implementation for User Story 4

- [X] T035 [US4] Add mode selector UI with Mixed plus all required standard mode categories to ConfigPanel in `frontend/src/components/ConfigPanel.tsx`
- [X] T036 [US4] Persist mode selection through userConfig without passing modes into current WSPR filtering in `frontend/src/components/WsprMap.tsx`

**Checkpoint**: User Story 4 is independently functional and testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and quality gates across all completed user stories.

- [X] T037 [P] Add Playwright smoke coverage for first-run panel, cog reopen, save action, band filtering, mode non-filtering, and mobile usability in `frontend/tests/ui/map-ui.spec.ts`
- [X] T038 [P] Review configuration UI copy, accessible names, form labels, and error text against `specs/007-add-config-panel/contracts/ui.md` in `frontend/src/components/ConfigPanel.tsx`
- [X] T039 Run `npm run lint` from `frontend/` and fix any issues in touched frontend files
- [X] T040 Run `npm run typecheck` from `frontend/` and fix any issues in touched frontend files
- [X] T041 Run `npm run test:coverage` from `frontend/` and fix any coverage or test failures in touched frontend files
- [X] T042 Run `npm run test:e2e` from `frontend/` and fix any UI regression failures in touched frontend files
- [X] T043 Run `npm run build` from `frontend/` and fix any build failures in touched frontend files
- [X] T044 Verify the manual quickstart scenarios in `specs/007-add-config-panel/quickstart.md` and update implementation if any scenario fails

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational; MVP entry point for the feature.
- **User Story 2 (Phase 4)**: Depends on Foundational and can be developed after or alongside US1, but final panel integration depends on ConfigPanel from US1.
- **User Story 3 (Phase 5)**: Depends on Foundational and ConfigPanel/WsprMap integration from US1.
- **User Story 4 (Phase 6)**: Depends on Foundational and ConfigPanel/WsprMap integration from US1.
- **Polish (Phase 7)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2; no dependency on other stories.
- **US2 (P1)**: Starts after Phase 2; uses ConfigPanel integration from US1 for full UI behavior.
- **US3 (P2)**: Starts after Phase 2; depends on WsprMap integration from US1 for visible filtering.
- **US4 (P3)**: Starts after Phase 2; depends on ConfigPanel integration from US1 for visible selection and persistence.

### Within Each User Story

- Tests should be added before implementation when practical and should fail before behavior is implemented.
- Service logic must be complete before WsprMap integration.
- Component tests should be updated before or alongside component behavior.
- Each user story should pass its independent test before proceeding to lower-priority stories.

---

## Parallel Examples

### User Story 1

```text
Task: "T016 Add ConfigPanel tests for dialog semantics, accessible labels, close action, save action, optional callsign, and restored saved values in frontend/src/components/ConfigPanel.test.tsx"
Task: "T017 Add WsprMap tests for first-run panel display, cog-open behavior, no-callsign general results, and preserved map state in frontend/src/components/WsprMap.test.tsx"
```

### User Story 2

```text
Task: "T023 Add ConfigPanel tests for empty, 4-character, 6-character, invalid Maidenhead, blocked save, and error message behavior in frontend/src/components/ConfigPanel.test.tsx"
Task: "T024 Add WsprMap tests proving saved Maidenhead values are restored through the panel without changing map position unexpectedly in frontend/src/components/WsprMap.test.tsx"
```

### User Story 3

```text
Task: "T027 Add ConfigPanel tests for band selector options, multi-select behavior, and Mixed exclusivity in frontend/src/components/ConfigPanel.test.tsx"
Task: "T028 Add WsprMap tests for single-band filtering, multi-band filtering, Mixed unfiltered behavior, unknown-band exclusion, and empty-result messaging in frontend/src/components/WsprMap.test.tsx"
```

### User Story 4

```text
Task: "T033 Add ConfigPanel tests for mode selector options, multi-select behavior, Mixed exclusivity, persistence, and restored values in frontend/src/components/ConfigPanel.test.tsx"
Task: "T034 Add WsprMap tests proving non-WSPR mode selections do not hide current WSPR results in frontend/src/components/WsprMap.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational shared services and unit tests.
3. Complete Phase 3: User Story 1.
4. Stop and validate that first-run configuration, cog reopen, optional callsign, persistence, and no-callsign general WSPR loading work independently.

### Incremental Delivery

1. Complete Setup plus Foundational services.
2. Deliver US1 as the MVP configuration entry point.
3. Deliver US2 for operating location validation and persistence.
4. Deliver US3 for current WSPR band filtering.
5. Deliver US4 for saved mode preferences without current WSPR mode filtering.
6. Run polish quality gates and quickstart validation.

### Parallel Team Strategy

1. One developer can implement `userConfig.ts` while another implements `wsprFilters.ts` after setup.
2. ConfigPanel tests and WsprMap tests for each story can be written in parallel.
3. After US1 integration exists, US2, US3, and US4 can proceed in parallel if merge coordination is handled around `ConfigPanel.tsx` and `WsprMap.tsx`.
