# Feature Specification: Propagation Terminator Overlay

**Feature Branch**: `004-terminator-overlay`

**Created**: 2026-05-18

**Status**: Draft

**Input**: User description: "Propagation overlay (grey line / terminator)
Show the day/night terminator on the map. WSPR propagation is heavily influenced by the ionosphere and whether paths are in daylight or darkness — this is one of the most useful contextual layers a WSPR map can add."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Current Day/Night Context (Priority: P1)

As a WSPR map user, I want to see the current day/night terminator on the map so I can interpret propagation paths in the context of daylight, darkness, sunrise, and sunset conditions.

**Why this priority**: The terminator is the core value of the feature and directly improves interpretation of WSPR propagation without requiring extra user action.

**Independent Test**: Open the map at a known time and compare the displayed day/night boundary against expected daylight and darkness regions; the map remains usable while the overlay is visible.

**Acceptance Scenarios**:

1. **Given** a user opens the WSPR map, **When** the map is displayed, **Then** the current day/night terminator is visible as a subtle contextual overlay.
2. **Given** WSPR paths are visible on the map, **When** the terminator overlay is shown, **Then** the paths, station markers, labels, and existing map controls remain readable and usable.
3. **Given** a location currently near sunrise or sunset, **When** the user views that area on the map, **Then** the overlay clearly indicates the approximate transition between daylight and darkness.

---

### User Story 2 - Keep Terminator Current During Use (Priority: P2)

As a WSPR map user who leaves the map open, I want the terminator to stay current so the propagation context remains accurate over time.

**Why this priority**: The terminator changes continuously, and stale daylight/darkness context can mislead users during longer monitoring sessions.

**Independent Test**: Leave the map open across a scheduled overlay refresh interval and verify that the day/night boundary advances without requiring a full page reload.

**Acceptance Scenarios**:

1. **Given** the map is open for an extended session, **When** time passes, **Then** the terminator position updates to reflect the current daylight and darkness boundary.
2. **Given** WSPR data refreshes while the map is open, **When** the refresh completes, **Then** the terminator remains visible and aligned with the current time.

---

### User Story 3 - Avoid Interference With Core Map Use (Priority: P3)

As a WSPR map user, I want the terminator overlay to be unobtrusive so it adds context without distracting from paths, map navigation, or callsign workflows.

**Why this priority**: The overlay should support analysis, not become a primary visual element or interfere with existing map tasks.

**Independent Test**: Use common map interactions with the overlay visible, including pan, zoom, callsign selection, and map refresh, and verify that existing workflows still complete successfully.

**Acceptance Scenarios**:

1. **Given** the terminator overlay is visible, **When** the user pans or zooms the map, **Then** the overlay remains geographically aligned and does not block map interaction.
2. **Given** the user opens callsign or map controls, **When** the terminator overlay is visible behind them, **Then** those controls remain readable and fully operable.

---

### Edge Cases

- At high latitudes during polar day or polar night, the overlay must still represent daylight and darkness without broken shapes or misleading gaps.
- Around the international date line, the daylight/darkness boundary must remain continuous and understandable.
- During very small or very large zoom levels, the overlay must remain subtle and must not dominate the map.
- If the overlay cannot be calculated or displayed, the core map must remain usable and the user must not see a disruptive error.
- If the device clock changes while the map is open, the overlay should recover on the next scheduled update and represent the current device time.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display the current day/night terminator on the main WSPR map.
- **FR-002**: The system MUST visually distinguish daylight, darkness, and the approximate transition boundary in a subtle way suitable for propagation context.
- **FR-003**: The overlay MUST be visible by default when the map is available.
- **FR-004**: The overlay MUST remain geographically aligned while users pan, zoom, or otherwise navigate the map.
- **FR-005**: The overlay MUST update during extended map sessions so it does not remain stale for more than 10 minutes.
- **FR-006**: The overlay MUST NOT prevent users from viewing WSPR paths, station information, map attribution, callsign controls, refresh controls, support links, or version status.
- **FR-007**: The overlay MUST NOT change WSPR lookup behavior, callsign persistence, map refresh timing, or the selected base map.
- **FR-008**: The system MUST preserve core map usability if the terminator overlay cannot be displayed.
- **FR-009**: The overlay MUST work across desktop and mobile-sized map views.
- **FR-010**: The feature MUST limit scope to current day/night context and MUST NOT add propagation prediction, path scoring, historical replay, or manual time controls.

### Key Entities

- **Terminator Overlay**: The contextual map layer representing the current split between daylight and darkness.
- **Transition Boundary**: The approximate grey-line region where day changes to night or night changes to day.
- **Daylight Region**: Areas of the map currently in daylight.
- **Darkness Region**: Areas of the map currently in darkness.
- **Observation Time**: The current time used to determine the visible daylight and darkness regions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of user checks against a trusted day/night reference show the displayed terminator within an acceptable visual tolerance for map-scale propagation analysis.
- **SC-002**: Users can identify whether a visible WSPR path endpoint is in daylight, darkness, or near the transition boundary within 5 seconds.
- **SC-003**: Existing primary map tasks, including callsign selection, panning, zooming, and manual refresh, remain completable with the overlay visible in 100% of acceptance tests.
- **SC-004**: During a 30-minute open-map session, the terminator updates at least three times without requiring a page reload.
- **SC-005**: On desktop and mobile-sized views, the overlay does not obscure required controls or map attribution in any tested viewport.

## Assumptions

- The first version shows the current real-time terminator only; historical replay, future prediction, and manual time selection are out of scope.
- The overlay is intended as contextual guidance for WSPR interpretation, not as a precise astronomical or scientific measurement tool.
- A subtle grey-line visual treatment is preferred so existing WSPR paths remain the primary focus.
- The feature applies to all users of the main map and does not require user accounts or permissions.
- The device's current time is an acceptable reference for determining the displayed daylight and darkness context.
