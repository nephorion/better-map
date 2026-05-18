# Feature Specification: Update Grayline Terminator

**Feature Branch**: `006-update-grayline-terminator`

**Created**: 2026-05-18

**Status**: Draft

**Input**: User description: "i want the graline /terminator to update on the site. So fi a user were to be on the site for hours the should see the grayline move.. I will leave it upt o you to decide how ofdter the screen neets to be updated. "

## Clarifications

### Session 2026-05-18

- Q: How should grayline updates behave when the browser tab is hidden or backgrounded? -> A: Update every 5 minutes while visible, and refresh immediately when the tab becomes visible again.
- Q: What does "immediately" mean for visibility-return refresh? -> A: The grayline refresh must be requested within 1 second of the map session becoming visible again.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See Grayline Movement Over Time (Priority: P1)

As a WSPR map user who keeps the site open for hours, I want the grayline terminator to move over time so the day/night context remains accurate without refreshing the page.

**Why this priority**: The feature's primary value is keeping propagation context current during long monitoring sessions, where a static grayline would become misleading.

**Independent Test**: Keep the site open for at least 15 minutes and verify that the grayline position updates while the map remains available.

**Acceptance Scenarios**:

1. **Given** a user has the map open and visible, **When** at least 5 minutes pass, **Then** the grayline terminator updates to reflect the current day/night boundary.
2. **Given** a user leaves the site open for several hours, **When** they continue viewing the map, **Then** the grayline has visibly advanced compared with its initial position.
3. **Given** the grayline updates, **When** the update occurs, **Then** the user does not need to reload the page or restart their session.

---

### User Story 2 - Preserve Map Usability During Updates (Priority: P2)

As a WSPR map user, I want grayline updates to happen quietly so they do not interrupt map navigation, callsign lookup, or path inspection.

**Why this priority**: The grayline is contextual information; it must not disrupt the core task of viewing WSPR activity.

**Independent Test**: Interact with the map while a scheduled grayline update occurs and verify that pan, zoom, callsign, and refresh workflows continue normally.

**Acceptance Scenarios**:

1. **Given** a user is panning or zooming the map, **When** the grayline refreshes, **Then** the interaction continues without focus changes, map position resets, zoom resets, or open-control dismissal.
2. **Given** a user is viewing WSPR paths or controls, **When** the grayline refreshes, **Then** paths, selected path details, labels, controls, attribution, support links, and version status remain readable and usable.
3. **Given** analytics are enabled, **When** the grayline refreshes, **Then** this feature does not emit custom analytics events for refresh timing, visibility return, or map interaction.

---

### User Story 3 - Recover From Long-Running Session Changes (Priority: P3)

As a WSPR map user returning to a long-open tab, I want the grayline to catch up to the current time so the displayed context is not stale after inactivity.

**Why this priority**: Users may leave the site open in the background or on a monitoring display, and the overlay should recover gracefully when attention returns.

**Independent Test**: Simulate a long-running or inactive browser session and verify that the grayline updates to current conditions without user intervention.

**Acceptance Scenarios**:

1. **Given** the site has been open in a background or inactive state, **When** the user returns to the map, **Then** the grayline refresh is requested within 1 second to reflect the current day/night boundary.
2. **Given** the device clock changes forward or backward while the site is open, **When** the next scheduled or visibility-return grayline update occurs, **Then** the overlay is recalculated from the current device time without relying on the previous observation time.

---

### Edge Cases

- If the initial grayline calculation has not completed, the map must remain usable without showing a disruptive grayline-specific error.
- If a scheduled grayline update cannot complete, the previous map view and previous overlay, if any, must remain usable and every later scheduled or visibility-return update must be allowed to retry.
- If the site remains open overnight, the grayline must continue advancing across the map rather than freezing at the original load time.
- If the user is actively interacting with the map at the update moment, the update must not steal focus or reset map position.
- If the user's device resumes from sleep, the grayline must catch up on the next scheduled or visibility-return update cycle.
- If a hidden or backgrounded tab becomes visible again before 5 minutes have elapsed, the grayline must refresh within 1 second only when the current overlay is stale by at least 5 minutes; otherwise it may continue the existing visible-session schedule.
- If a hidden or backgrounded tab becomes visible again after at least 5 minutes, the grayline must request a refresh within 1 second rather than waiting for the next 5-minute interval.
- If the user has a low-power or constrained device, updates must remain step-based at the 5-minute cadence while visible and must not run constant animation or a separate high-frequency timer.
- At high latitudes and around the international date line, the refreshed grayline geometry must remain continuous and understandable without broken shapes or misleading gaps.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST refresh the grayline terminator automatically while the site remains open.
- **FR-002**: The grayline terminator MUST update at least once every 5 minutes while the map session is visible.
- **FR-002a**: The grayline terminator MUST request a refresh within 1 second when a hidden, backgrounded, or resumed map session becomes visible and the current overlay is at least 5 minutes stale.
- **FR-003**: The update MUST use the current time at the moment of refresh, not only the time when the site first loaded.
- **FR-004**: Users MUST be able to see the grayline move during multi-hour sessions without manually refreshing the page.
- **FR-005**: Grayline updates MUST NOT reset map position, zoom level, selected base map, active callsign, visible WSPR data, selected path details, or open map controls.
- **FR-006**: Grayline updates MUST NOT block callsign lookup, map navigation, WSPR refresh, refresh controls, support links, analytics behavior, or version status display.
- **FR-007**: If a grayline update fails, the system MUST keep the existing map usable, preserve the previous overlay when present, avoid disruptive user-visible errors, and attempt normal updates again on each later scheduled or visibility-return refresh.
- **FR-008**: The update cadence MUST balance freshness and usability by using step-based refreshes only, avoiding constant animation, preserving focus, preserving open controls, and completing scheduled or visibility-return refresh work without user-visible interruption.
- **FR-009**: The feature MUST work for long-running desktop and mobile-sized sessions.
- **FR-010**: The feature MUST remain limited to keeping the current grayline terminator fresh and MUST NOT add historical playback, future-time preview, manual time controls, or propagation prediction.
- **FR-011**: The feature MUST NOT add a new production dependency or external network service for grayline refresh calculation unless a later approved requirement changes the accuracy scope.
- **FR-012**: The feature MUST NOT emit custom analytics events for grayline refreshes, visibility-return refreshes, or refresh failures.
- **FR-013**: The grayline overlay MUST be visually subordinate to WSPR paths and controls by remaining behind path data and preserving control readability and operability on desktop and mobile-sized viewports.
- **FR-014**: Refreshed grayline geometry MUST remain valid and understandable at high latitudes and across the international date line.

### Key Entities

- **Grayline Terminator**: Canonical term for the visible day/night boundary overlay shown on the map; references to grayline, terminator, and day/night boundary in this feature describe this same concept.
- **Overlay Presentation**: The visual styling of the grayline terminator, which is separate from the calculated geometry and must remain subordinate to WSPR paths and controls.
- **Refresh Cadence**: The recurring interval used to update the grayline while the site remains open.
- **Observation Time**: The current time used to calculate the grayline position during each refresh.
- **Long-Running Session**: A site session that remains open long enough for the day/night boundary to move meaningfully.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: During a 30-minute open-map session, the grayline updates at least 6 times without requiring a page reload.
- **SC-002**: During a 2-hour visible open-map session, the grayline position differs from the initial position by enough to be distinguishable at world-map scale in 100% of acceptance checks.
- **SC-003**: 100% of tested grayline updates preserve map position, zoom level, selected base map, selected callsign, selected path details, visible WSPR data, and active user controls.
- **SC-004**: Users can continue panning, zooming, using callsign controls, using refresh controls, viewing support links, viewing version status, and refreshing WSPR data successfully during scheduled grayline updates in all acceptance tests.
- **SC-005**: When a hidden, backgrounded, or resumed map session becomes visible with an overlay at least 5 minutes stale, the grayline refresh is requested within 1 second in 100% of visibility-return tests.
- **SC-006**: Grayline update failures do not produce a disruptive user-visible error, preserve the previous overlay when present, and do not prevent continued map use in any tested failure scenario.
- **SC-007**: Desktop and mobile-sized acceptance checks both show readable controls, readable attribution, visible WSPR paths, and a visually subordinate grayline overlay after scheduled and visibility-return refreshes.

## Assumptions

- A 5-minute update cadence is an appropriate default for showing grayline movement during long sessions while avoiding distracting continuous animation.
- Grayline updates should conserve resources while the site is hidden, then catch up immediately when the user returns.
- The grayline should appear to step forward at each refresh rather than animate constantly.
- The user's current device time is an acceptable reference for refreshing the displayed grayline terminator; if the device clock is inaccurate, the displayed boundary may reflect that inaccuracy until the clock is corrected.
- This specification extends the grayline/terminator overlay behavior and does not add new user-facing controls.
- Existing analytics remains page-view-only for this feature; grayline refreshes are not tracked as custom events.
