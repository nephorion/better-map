# Feature Specification: WSPR Callsign Activity Map

**Feature Branch**: `001-wspr-map-integration`

**Created**: 2026-05-16

**Status**: Draft

**Input**: User description: "For the first feature I want to be able to type a call sign eg VK2DJJ. It should connect to a WSPR-compatible data provider, initially WSPR.live, get the activity for the last 10 days, and map it on the map. I also want two shell scripts in the main repo that will start the backend and the frontend. The frontend should also start a Cloudflare tunnel/proxy to access the site."

## Clarifications

### Session 2026-05-16

- Q: What should the first version do when a callsign has a very large number of WSPR spots in the last 10 days? → A: Show the most recent 1,000 spots and indicate results were truncated.
- Q: How should WSPR activity be represented on the first map view? → A: Lines between transmitter and receiver.
- Q: What privacy/security posture should the first version assume for WSPR callsign searches? → A: No login; public callsign searches only.
- Q: If Cloudflare tunnel/proxy startup fails, what should the frontend start script do? → A: Stop the frontend too.
- Q: How long should a callsign search wait for WSPR data before showing a timeout error? → A: 10 seconds.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search Callsign Activity (Priority: P1)

A casual HAM radio operator enters a callsign and sees recent WSPR activity plotted geographically on the map.

**Why this priority**: This is the core feature value: the app must make callsign activity visible through an excellent map experience.

**Independent Test**: Search for a known active callsign such as `VK2DJJ` and confirm that recent WSPR activity is displayed on the map with useful visual details.

**Acceptance Scenarios**:

1. **Given** the app is open with the map visible, **When** the user searches for `VK2DJJ`, **Then** the map displays WSPR activity from the last 10 days for that callsign.
2. **Given** activity exists for the callsign, **When** the results are displayed, **Then** each mapped path exposes enough detail for the user to understand the contact, including time, transmitter, receiver, signal strength, distance, and band when available.
3. **Given** no activity exists for the callsign in the last 10 days, **When** the user searches, **Then** the app clearly tells the user that no recent WSPR activity was found.

---

### User Story 2 - Inspect Activity on the Map (Priority: P2)

A user explores WSPR activity visually by zooming, panning, and selecting map items to inspect individual reports.

**Why this priority**: The map is intended to be the killer feature, so the first feature must establish an interactive and appealing map interaction model.

**Independent Test**: Search for a callsign with multiple results, zoom and pan the map, select plotted activity, and verify the map remains easy to use.

**Acceptance Scenarios**:

1. **Given** multiple activity records are visible, **When** the user zooms or pans, **Then** the map stays responsive and preserves the visible activity.
2. **Given** a mapped activity item is selected, **When** the user opens its details, **Then** the app shows a concise summary of the WSPR report.

---

### User Story 3 - Start Local Development Easily (Priority: P3)

A developer can start the backend and frontend from the repository root using simple shell scripts.

**Why this priority**: The project constitution prioritizes easy UX and community extensibility; contributors need a low-friction local workflow.

**Independent Test**: From a fresh checkout with dependencies installed, run the documented start scripts and verify both app halves become available.

**Acceptance Scenarios**:

1. **Given** the repository is checked out locally, **When** the developer runs the backend start script, **Then** the backend service starts and reports a usable local address.
2. **Given** the repository is checked out locally, **When** the developer runs the frontend start script, **Then** the frontend starts only if the Cloudflare tunnel/proxy process also starts successfully.

---

### Edge Cases

- WSPR-compatible data provider, initially WSPR.live, is unavailable, slow, rate limited, returns invalid data, or does not respond within 10 seconds.
- Callsign includes lowercase letters, whitespace, or invalid characters.
- Callsign has more than 1,000 spots in the last 10 days; the system shows the most recent 1,000 and indicates that results were truncated.
- Some WSPR activity records are missing coordinates or contain invalid coordinates.
- The local Cloudflare tunnel/proxy tool is not installed or cannot authenticate; the frontend start script stops and reports the failure.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a prominent callsign search input that is visible above the map on initial page load, reachable in normal keyboard tab order before map controls, and paired with a visible search action.
- **FR-002**: The system MUST normalize callsign input by trimming whitespace and accepting lowercase or uppercase input.
- **FR-003**: The system MUST reject invalid callsign input before querying external data; valid input is 3-12 characters after trimming and may contain only letters, digits, and `/`.
- **FR-004**: The system MUST retrieve WSPR activity associated with the searched callsign for the last 10 days from a WSPR-compatible data provider, initially WSPR.live.
- **FR-005**: The system MUST include both transmitted and received activity for the searched callsign when available.
- **FR-006**: The system MUST display retrieved activity geographically as lines between transmitter and receiver locations on the map.
- **FR-007**: The system MUST provide useful details for each mapped activity item, including timestamp, transmitter callsign, receiver callsign, distance, signal strength, frequency or band, and available location information.
- **FR-008**: The system MUST communicate loading, empty, and error states with short, non-technical plain-language messages that name the cause where known and suggest a next action when one exists.
- **FR-009**: The system MUST protect the user experience from excessive result volume by showing at most the most recent 1,000 activity records and indicating when results were truncated.
- **FR-010**: The repository MUST include a shell script to start the backend from the repository root.
- **FR-011**: The repository MUST include a shell script to start the frontend from the repository root.
- **FR-012**: The frontend start script MUST start a Cloudflare tunnel/proxy process and stop the frontend if the tunnel/proxy cannot start, clearly reporting the failure reason.
- **FR-013**: The first version MUST allow public callsign searches without user login or account creation.
- **FR-014**: The system MUST show a timeout error if a WSPR activity lookup does not complete within 10 seconds.
- **FR-015**: The system MUST show distinct plain-language messages for provider timeout, provider rate limit, provider unavailable, and invalid provider data cases.
- **FR-016**: Failed, timed-out, or rate-limited lookups MUST preserve the previous successful map results while showing a non-destructive error message for the failed lookup.
- **FR-017**: Duplicate WSPR activity records MUST be deduplicated by provider spot identifier when available; records without provider identifiers MUST be deduplicated by timestamp, transmitter callsign, receiver callsign, frequency, and endpoint coordinates.
- **FR-018**: Cloudflare tunnel/proxy startup failures MUST distinguish missing `cloudflared`, authentication failure, tunnel startup failure, and missing tunnel URL discovery, and each case MUST stop the frontend process with an actionable message.
- **FR-019**: The main map view MUST meet basic accessibility requirements: the callsign input and search action have accessible labels, search is keyboard-operable, status messages are announced to assistive technology, selected path details can be reached by keyboard, and map controls do not trap focus.
- **FR-020**: The backend MUST log provider timeout, provider rate limit, provider unavailable, invalid provider data, truncation, and startup script failure events without logging user IP addresses or browser identifiers.
- **FR-021**: Application logs MAY include searched callsigns for troubleshooting, but MUST NOT combine callsigns with user-identifying data in this first version.

### Key Entities *(include if feature involves data)*

- **Callsign**: A user-provided amateur radio station identifier used to find WSPR activity.
- **WSPR Activity**: A reported WSPR spot containing time, transmitter, receiver, coordinates, band/frequency, signal report, and distance.
- **Map Activity Item**: A user-facing transmitter-to-receiver line representing one or more WSPR activity records on the map.
- **Local Start Script**: A repository-level command that starts part of the development environment.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can search for a callsign and see recent mapped activity in under 5 seconds when the provider returns up to 1,000 valid records within the 10-second provider timeout.
- **SC-002**: At least 90% of a curated 20-callsign validation set with known WSPR activity show visible map results without requiring additional user configuration.
- **SC-003**: The map responds to pan, zoom, and item selection interactions within 250 milliseconds with up to 1,000 displayed activity records.
- **SC-004**: A developer can start the backend and frontend using repository-root scripts without manually changing directories.
- **SC-005**: If the Cloudflare tunnel/proxy cannot start, the frontend script stops the frontend process and reports an actionable error instead of failing silently.
- **SC-006**: Users receive a clear timeout message within 10 seconds when WSPR activity cannot be retrieved in time.

## Assumptions

- WSPR activity can be sourced from a public WSPR-compatible data provider, initially WSPR.live, without requiring user authentication for this first feature.
- Callsign search data is public WSPR activity and does not require application user accounts in the first version.
- For the first version, a searched callsign matches either transmitter or receiver callsign.
- Historical scope is fixed at the last 10 days.
- The first version shows at most the most recent 1,000 activity records for a searched callsign.
- The local development scripts target Unix-like shell environments first.
- WSPR.live is a volunteer-operated public data source; the app must respect published access limits, must not assume guaranteed availability, and this first feature is intended for free/non-commercial access patterns.
