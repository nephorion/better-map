# Tasks: WSPR Callsign Activity Map

**Input**: Design documents from `specs/001-wspr-map-integration/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: Required by the Speckit Constitution. All code changes must include tests, maintain 100% code coverage, pass linting, and pass typechecking. Python code must pass Ruff linting.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Setup, foundational, and polish tasks do not use story labels

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add shared project tooling, quality gates, deployment readiness, and package dependencies.

- [x] T001 Add backend test, 100% coverage, Ruff, and backend typechecking dependencies to `backend/pyproject.toml`
- [x] T002 Add backend Ruff, typechecking, and 100% coverage configuration to `backend/pyproject.toml`
- [x] T003 [P] Add backend package skeleton files in `backend/src/better_map/__init__.py`, `backend/src/better_map/api/__init__.py`, `backend/src/better_map/models/__init__.py`, and `backend/src/better_map/services/__init__.py`
- [x] T004 [P] Add frontend map, test, and coverage dependencies to `frontend/package.json`
- [x] T005 [P] Add frontend test and 100% coverage configuration in `frontend/vitest.config.ts` and `frontend/src/test/setup.ts`
- [x] T006 Add Railway deployment/build configuration for the split FastAPI backend and Vite frontend in repository-root `railway.json` and `nixpacks.toml`, including backend install/start commands and frontend build/static output commands
- [x] T007 [P] Add backend quality command documentation to `backend/README.md`
- [x] T008 [P] Add frontend quality command documentation to `frontend/README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend, frontend, and error-handling infrastructure that MUST be complete before user stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T009 Create FastAPI application factory and health endpoint in `backend/src/better_map/api/app.py`
- [x] T010 Update backend entry point to use the application factory in `backend/main.py`
- [x] T011 [P] Add backend health endpoint tests in `backend/tests/contract/test_health.py`
- [x] T012 [P] Define shared API error response model in `backend/src/better_map/models/errors.py`
- [x] T013 [P] Define frontend API client error types in `frontend/src/services/apiClient.ts`
- [x] T014 Create base frontend app layout and map page shell in `frontend/src/App.tsx`
- [x] T015 [P] Add frontend app shell tests in `frontend/src/App.test.tsx`
- [x] T016 Configure frontend environment variables for backend URL in `frontend/src/services/config.ts`
- [x] T017 [P] Add frontend config tests in `frontend/src/services/config.test.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Search Callsign Activity (Priority: P1) MVP

**Goal**: A casual HAM radio operator enters a callsign and sees recent WSPR transmitter-to-receiver paths on the map.

**Independent Test**: Search for a known active callsign and confirm recent WSPR activity appears as map paths or a clear empty/error state is shown.

### Tests for User Story 1

- [x] T018 [P] [US1] Add callsign validation unit tests in `backend/tests/unit/test_callsign_query.py`
- [x] T019 [P] [US1] Add WSPR activity model unit tests in `backend/tests/unit/test_wspr_activity.py`
- [x] T020 [P] [US1] Add WSPR-compatible provider service unit tests for success, timeout, rate limit, provider unavailable, invalid data, no results, both roles, deduplication, and truncation in `backend/tests/unit/test_wspr_live_provider.py`
- [x] T021 [P] [US1] Add API contract tests for `GET /api/wspr/activity` in `backend/tests/contract/test_wspr_activity_api.py`
- [x] T022 [P] [US1] Add frontend API service tests for success, empty, truncated, invalid callsign, provider rate limit, provider unavailable, invalid provider data, timeout states, and preservation of previous successful results in `frontend/src/services/wsprActivity.test.ts`
- [x] T023 [P] [US1] Add search form component tests for placement, keyboard operation, accessible labels, and validation messaging in `frontend/src/components/CallsignSearch.test.tsx`

### Implementation for User Story 1

- [x] T024 [P] [US1] Implement callsign query validation model in `backend/src/better_map/models/callsign.py`
- [x] T025 [P] [US1] Implement WSPR activity and lookup response models in `backend/src/better_map/models/wspr.py`
- [x] T026 [US1] Implement WSPR.live provider service with 10-second timeout, transmitter/receiver role matching, 10-day window, most-recent sorting, deduplication, 1,000-record cap, coordinate filtering, rate-limit handling, provider-unavailable handling, invalid-data handling, and provider event logging in `backend/src/better_map/services/wspr_live.py`
- [x] T027 [US1] Implement WSPR activity API route in `backend/src/better_map/api/wspr.py`
- [x] T028 [US1] Register WSPR activity API route in `backend/src/better_map/api/app.py`
- [x] T029 [P] [US1] Implement frontend WSPR activity API service in `frontend/src/services/wsprActivity.ts`
- [x] T030 [P] [US1] Implement prominent accessible callsign search component with keyboard operation and validation messaging in `frontend/src/components/CallsignSearch.tsx`
- [x] T031 [US1] Integrate callsign search, loading, empty, invalid input, provider rate limit, provider unavailable, invalid provider data, timeout, non-destructive failed lookup recovery, and truncation states into `frontend/src/App.tsx`

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Inspect Activity on the Map (Priority: P2)

**Goal**: A user explores WSPR activity visually by panning, zooming, and selecting paths for details.

**Independent Test**: Search for a callsign with multiple results, inspect map paths, and verify readable details are available.

### Tests for User Story 2

- [x] T032 [P] [US2] Add map feature conversion tests in `frontend/src/services/mapFeatures.test.ts`
- [x] T033 [P] [US2] Add map view tests for path rendering inputs, selected path details, truncation notice, empty state, and 250-millisecond interaction responsiveness criteria in `frontend/src/components/WsprMap.test.tsx`
- [x] T034 [P] [US2] Add selected activity details tests for readable content, keyboard reachability, and accessible status behavior in `frontend/src/components/ActivityDetails.test.tsx`

### Implementation for User Story 2

- [x] T035 [P] [US2] Implement map feature conversion helpers in `frontend/src/services/mapFeatures.ts`
- [x] T036 [US2] Implement MapLibre map component with transmitter-to-receiver line layer in `frontend/src/components/WsprMap.tsx`
- [x] T037 [P] [US2] Implement keyboard-reachable selected activity details component in `frontend/src/components/ActivityDetails.tsx`
- [x] T038 [US2] Integrate map path rendering and selected activity details into `frontend/src/App.tsx`
- [x] T039 [US2] Add map styles for path lines, selection, status messages, and responsive layout in `frontend/src/App.css`

**Checkpoint**: User Stories 1 and 2 are independently functional and testable.

---

## Phase 5: User Story 3 - Start Local Development Easily (Priority: P3)

**Goal**: A developer starts backend and frontend from repository-root shell scripts, with frontend startup requiring Cloudflare tunnel/proxy startup.

**Independent Test**: Run the repository-root start scripts and verify the expected service URLs or actionable failure messages.

### Tests for User Story 3

- [x] T040 [P] [US3] Add script static validation tests for backend and frontend start scripts, including missing `cloudflared`, authentication failure, tunnel startup failure, and missing URL discovery cases, in `tests/scripts/test_start_scripts.py`

### Implementation for User Story 3

- [x] T041 [US3] Add repository-root backend startup script in `scripts/start-backend.sh`
- [x] T042 [US3] Add repository-root frontend startup script that starts Vite and stops it if Cloudflare tunnel/proxy startup fails, distinguishing missing `cloudflared`, authentication failure, tunnel startup failure, and missing URL discovery in `scripts/start-frontend.sh`
- [x] T043 [US3] Add local startup instructions and Cloudflare failure behavior to `README.md`
- [x] T044 [US3] Update feature quickstart with final script command details in `specs/001-wspr-map-integration/quickstart.md`

**Checkpoint**: All user stories are independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality, documentation, and coverage gates across all stories.

- [x] T045 [P] Add backend coverage, Ruff, and typechecking CI command documentation to `README.md`
- [x] T046 [P] Add frontend lint, typecheck, test, coverage, and build command documentation to `README.md`
- [x] T047 Run backend Ruff, typechecking, tests, and 100% coverage gate using `backend/pyproject.toml`
- [x] T048 Run frontend lint, typecheck, tests, 100% coverage gate, and build using `frontend/package.json`
- [x] T049 Validate Railway deployment config against backend and frontend start/build commands in repository-root `railway.json` and `nixpacks.toml`
- [x] T050 Validate `specs/001-wspr-map-integration/quickstart.md` manually and update any stale command output or URLs

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies; can start immediately.
- **Phase 2 Foundational**: Depends on Phase 1; blocks all user stories.
- **Phase 3 US1**: Depends on Phase 2; MVP scope.
- **Phase 4 US2**: Depends on US1 API data shape and frontend state from Phase 3.
- **Phase 5 US3**: Depends on Phase 1 setup and can proceed after backend/frontend commands stabilize.
- **Phase 6 Polish**: Depends on all selected user stories.

### User Story Dependencies

- **US1 Search Callsign Activity**: No dependency on other user stories after foundation; delivers MVP.
- **US2 Inspect Activity on the Map**: Depends on US1 response models and frontend activity state.
- **US3 Start Local Development Easily**: Can be developed independently after setup, but final validation depends on backend/frontend commands from US1/US2.

### Within Each User Story

- Tests must be written before implementation and initially fail.
- Models before services.
- Services before endpoints.
- API services before UI integration.
- Story complete before moving to the next priority unless parallel ownership is explicit.

---

## Parallel Opportunities

- T003, T004, T005, T007, and T008 can run in parallel during setup.
- T011, T012, T013, T015, and T017 can run in parallel during foundation.
- US1 test tasks T018 through T023 can run in parallel before implementation.
- US1 model and frontend component tasks T024, T025, T029, and T030 can run in parallel after tests exist.
- US2 test tasks T032 through T034 can run in parallel before map implementation.
- US2 helper/details tasks T035 and T037 can run in parallel.
- US3 script test task T040 can run before script implementation tasks T041 and T042.

---

## Parallel Example: User Story 1

```text
Task: "T018 [US1] Add callsign validation unit tests in backend/tests/unit/test_callsign_query.py"
Task: "T019 [US1] Add WSPR activity model unit tests in backend/tests/unit/test_wspr_activity.py"
Task: "T020 [US1] Add WSPR provider service unit tests in backend/tests/unit/test_wspr_live_provider.py"
Task: "T021 [US1] Add API contract tests for GET /api/wspr/activity in backend/tests/contract/test_wspr_activity_api.py"
Task: "T022 [US1] Add frontend API service tests in frontend/src/services/wsprActivity.test.ts"
Task: "T023 [US1] Add search form component tests in frontend/src/components/CallsignSearch.test.tsx"
```

## Parallel Example: User Story 2

```text
Task: "T032 [US2] Add map feature conversion tests in frontend/src/services/mapFeatures.test.ts"
Task: "T033 [US2] Add map view tests in frontend/src/components/WsprMap.test.tsx"
Task: "T034 [US2] Add selected activity details tests in frontend/src/components/ActivityDetails.test.tsx"
```

## Parallel Example: User Story 3

```text
Task: "T040 [US3] Add script static validation tests in tests/scripts/test_start_scripts.py"
Task: "T041 [US3] Add repository-root backend startup script in scripts/start-backend.sh"
Task: "T042 [US3] Add repository-root frontend startup script in scripts/start-frontend.sh"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundation.
3. Complete Phase 3 User Story 1.
4. Stop and validate backend tests, frontend tests, linting, typechecking, build, and 100% backend/frontend coverage.
5. Demo callsign search with WSPR path data or clear empty/error states.

### Incremental Delivery

1. Setup + foundation establishes test, lint, app, and deployment readiness.
2. US1 delivers searchable WSPR activity data and primary app states.
3. US2 delivers the polished interactive map experience.
4. US3 delivers contributor-friendly local startup scripts.
5. Polish validates quality gates, Railway readiness, and documentation.
