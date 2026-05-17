# Feature Specification: Full-Window WSPR Map Experience

**Feature Branch**: `002-deckgl-map-ui`

**Created**: 2026-05-17

**Status**: Draft

**Input**: User description: "I want to integrate deckgl into the framework. I also want to change the UI a biit. I want the map to fill the whoile browser window. No frames no borderts. When a user initially hits the site and there is no saved callsign a popup should prompt them for their callsign/ The collasing will then be used for all the queries. It should be shown in a panel that overlays the map on the right. If the user clicks on this view again it should apoopup the callsign selection and allow the user to change the callsing. I also want the map to poll for new data 54 minutes. There should be a small countdown and if that is clicked the update should be forced. Remove the contact list but when a user clicks on a contact line on the map show a panel that overlyas the map with the contact details. Create aa new branch for thisd work."

## Clarifications

### Session 2026-05-17

- Q: Should deck.gl be a mandatory implementation constraint for this feature, or only a preferred approach if planning confirms it fits? → A: Mandatory
- Q: When should the refresh countdown restart? → A: After refresh completion, with a 5-minute default countdown
- Q: What minimum fields must the contact detail overlay show? → A: All available fields
- Q: How should users recover when no callsign is set and the initial prompt is dismissed or invalid? → A: Persistent Set Callsign control
- Q: What should happen if the selected contact is no longer present after a refresh? → A: Close panel
- Q: Where should the active callsign be persisted for returning users? → A: Browser localStorage
- Q: Which standard open base map layers should the map switcher include initially? → A: All suitable open layers discovered during planning, subject to attribution and usage limits
- Q: Should the app display the short hash of the running code version? → A: Yes, subtly at the bottom left
- Q: Which initial open base map layers are required? → A: OpenStreetMap Standard, OpenTopoMap, and OpenStreetMap Humanitarian
- Q: How should version hashes be supplied and validated? → A: Generate frontend metadata, expose backend hash, and show an error on mismatch
- Q: What is the source for all contact detail fields? → A: All fields returned from the WSPRNET/WSPR API payload for the selected contact
- Q: What has priority if attribution and version hash compete for space? → A: Attribution has priority
- Q: How should overlay placement work on narrow/mobile screens when multiple panels are active? → A: Stacked overlays with scrolling when needed
- Q: What should the refresh countdown display look like? → A: Compact top-right mm:ss overlay button
- Q: How subtle should the version hash be while remaining readable? → A: Small monospace low-opacity text with contrast fallback
- Q: What should happen if browser localStorage is unavailable or write fails? → A: Continue session-only and show a non-destructive persistence warning
- Q: How should keyboard or assistive-technology users access contact details without clicking map paths? → A: Map paths are keyboard-focusable and selectable directly

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start With Saved Callsign Context (Priority: P1)

As a radio operator visiting the map, I want the site to prompt me for my callsign when none is saved, then use that callsign for all displayed activity so I can immediately see relevant WSPR contacts without extra setup.

**Why this priority**: Callsign context is required before the map can present meaningful user-specific contact data.

**Independent Test**: Can be tested by visiting the site with no saved callsign, entering a valid callsign, and confirming that the selected callsign is displayed and the map activity is loaded for that callsign.

**Acceptance Scenarios**:

1. **Given** no callsign is saved for the visitor, **When** the visitor opens the site, **Then** a callsign prompt appears before callsign-specific data is queried.
2. **Given** the visitor enters a valid callsign, **When** they confirm the prompt, **Then** the prompt closes, the callsign is saved for future visits, and all contact data shown on the map is scoped to that callsign.
3. **Given** a callsign is already saved, **When** the visitor opens the site, **Then** no initial callsign prompt appears and the map loads using the saved callsign.
4. **Given** no valid callsign is active and the callsign prompt is not open, **When** the visitor views the map, **Then** a persistent Set Callsign overlay control is available to reopen callsign selection.

---

### User Story 2 - Use a Full-Window Map With Overlay Controls (Priority: P1)

As a radio operator, I want the map to fill the entire browser window with overlay panels instead of surrounding frames or borders so the contact paths remain the primary focus.

**Why this priority**: The feature is a map-first experience; maximizing map area improves scanning, panning, zooming, and contact path interpretation.

**Independent Test**: Can be tested by opening the site on desktop and mobile-sized viewports and confirming the map fills the visible browser area while controls overlay the map without adding a separate framed layout.

**Acceptance Scenarios**:

1. **Given** the site is open, **When** the page finishes loading, **Then** the map occupies the full visible browser window with no outer application frame, border, or separate contact-list column.
2. **Given** a callsign is active, **When** the map is visible, **Then** the active callsign appears in a right-side overlay panel on top of the map.
3. **Given** the active callsign panel is visible, **When** the user clicks it, **Then** the callsign prompt opens and allows the user to select a different callsign.
4. **Given** the user changes the callsign, **When** the new callsign is confirmed, **Then** the map refreshes using the new callsign and the overlay shows the new value.
5. **Given** the map is visible, **When** the page is loaded, **Then** the short code version hash appears as small low-opacity monospace text in the bottom-left corner without blocking map use.

---

### User Story 3 - Change Base Map Layer (Priority: P2)

As a radio operator, I want to switch between standard open base map layers so I can choose the background that best supports reading WSPR contact paths.

**Why this priority**: Different map layers improve readability for different geography, terrain, contrast, and user preference needs.

**Independent Test**: Can be tested by opening the map layer control, selecting a different open base map layer, and confirming the map background changes while contact paths and overlays remain available.

**Acceptance Scenarios**:

1. **Given** the map is visible, **When** the user opens the base map selector, **Then** OpenStreetMap Standard, OpenTopoMap, and OpenStreetMap Humanitarian are available with clear names.
2. **Given** the user selects a base map layer, **When** the selection is applied, **Then** the map background changes without clearing the active callsign, current contact paths, countdown, or selected contact details.
3. **Given** a base map layer requires attribution, **When** that layer is active, **Then** the required attribution remains visible or accessible to the user.

---

### User Story 4 - Keep Map Data Current (Priority: P2)

As a radio operator monitoring contacts, I want the map to refresh automatically on a predictable schedule with a visible countdown and a manual refresh option so I can trust that the display remains current.

**Why this priority**: WSPR contact activity changes over time, and users need confidence that stale data is not silently displayed.

**Independent Test**: Can be tested by loading map data, observing the countdown, forcing a refresh by clicking it, and confirming the scheduled refresh occurs when the countdown reaches zero.

**Acceptance Scenarios**:

1. **Given** contact data has loaded for the active callsign, **When** the refresh countdown is visible, **Then** it shows the remaining time as a compact top-right `mm:ss` overlay button.
2. **Given** the countdown reaches zero, **When** an automatic update starts, **Then** the map requests fresh data for the active callsign and resets the countdown after the update completes or fails.
3. **Given** the countdown is visible, **When** the user clicks it, **Then** the map immediately starts a data refresh for the active callsign.
4. **Given** a refresh fails, **When** an error is shown, **Then** the previous successful map data remains visible and the next refresh remains scheduled.

---

### User Story 5 - Inspect Contact Details From the Map (Priority: P2)

As a radio operator, I want to click a contact path on the map and see its details in an overlay panel so I can inspect an individual contact without leaving the map view.

**Why this priority**: Removing the contact list makes map-based inspection the primary path for exploring individual contacts.

**Independent Test**: Can be tested by clicking a visible contact path and confirming a contact detail panel appears over the map with the selected contact's information.

**Acceptance Scenarios**:

1. **Given** contact paths are visible on the map, **When** the user clicks one path, **Then** a contact detail panel appears over the map.
2. **Given** a contact detail panel is open, **When** the user selects a different contact path, **Then** the panel updates to show the newly selected contact.
3. **Given** a contact detail panel is open, **When** the user dismisses it or clicks an appropriate close control, **Then** the panel closes and the full map remains usable.
4. **Given** contact paths are visible on the map, **When** a keyboard or assistive-technology user focuses and activates a path directly on the map, **Then** the contact detail panel appears for that path without requiring a separate contact list.

### Edge Cases

- If the user dismisses the initial callsign prompt without entering a callsign, the map remains visible, no callsign-specific query is made, and a persistent Set Callsign overlay control remains available.
- If the saved callsign is invalid under the existing callsign rules, the user is prompted to enter a valid callsign before data is queried.
- If the active callsign has no returned contacts, the map remains full-screen and shows a clear empty state without restoring the removed contact list.
- If the browser window is narrow, overlay panels remain accessible without preventing basic map panning and zooming.
- If a refresh is already in progress, clicking the countdown again does not start duplicate overlapping refreshes.
- If a contact path becomes unavailable after refresh, any open details panel for that contact closes without losing the refreshed map data.
- If a selected base map layer fails to load or becomes unavailable, the map keeps the current contact overlays available and offers another open base map layer when possible.
- If required map attribution competes for bottom-left space with the version hash, attribution keeps priority and the version hash moves to a nearby non-blocking position.
- If the frontend version hash and backend version hash are both available but do not match, the map shows a clear non-destructive version mismatch error.
- If multiple overlay panels are active on a narrow/mobile viewport, overlays stack vertically and allow scrolling when needed while preserving access to core map controls.
- If browser localStorage is unavailable or saving the callsign fails, the active callsign remains usable for the current session and the map shows a non-destructive warning that returning-user setup may not persist.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display the map as the primary full-window interface with no outer frame, border, or persistent non-map contact-list area.
- **FR-002**: The system MUST prompt the user for a callsign before making callsign-specific data requests when no saved callsign is available.
- **FR-003**: The system MUST save the confirmed callsign in browser localStorage for future visits on the same user device or browser profile.
- **FR-004**: The system MUST use the active callsign for every contact data query until the user changes it.
- **FR-005**: The system MUST display the active callsign in a right-side overlay panel on top of the map.
- **FR-006**: The system MUST open the callsign selection prompt when the user clicks the active callsign overlay.
- **FR-007**: The system MUST refresh the map data when the user confirms a different callsign.
- **FR-008**: The system MUST automatically poll for updated contact data every 5 minutes while a valid callsign is active and the map is open, with the countdown restarting after each refresh completes or fails.
- **FR-009**: The system MUST display a compact top-right countdown overlay button showing the time remaining until the next automatic update in `mm:ss` format.
- **FR-010**: The system MUST force an immediate data update when the user clicks the countdown.
- **FR-011**: The system MUST prevent duplicate overlapping data refreshes for the same active callsign.
- **FR-012**: The system MUST remove the persistent contact list from the main interface.
- **FR-013**: The system MUST allow users to select a visible contact path directly on the map.
- **FR-014**: The system MUST show all fields returned from the WSPRNET/WSPR API payload for the selected displayed contact in an overlay panel on top of the map.
- **FR-015**: The system MUST keep previous successful map data visible when a refresh fails, while clearly communicating that the update did not complete.
- **FR-016**: The system MUST preserve existing callsign validation expectations for accepted callsign values.
- **FR-017**: The system MUST support both desktop and mobile-sized browser windows without requiring horizontal page scrolling for core map controls.
- **FR-018**: The implementation plan MUST use deck.gl as the required technology for rendering map overlays and selectable contact paths.
- **FR-019**: The system MUST show a persistent Set Callsign overlay control whenever no valid callsign is active and the callsign prompt is not open.
- **FR-020**: The system MUST close the contact detail panel when refreshed results no longer include the selected contact.
- **FR-021**: The system MUST provide a base map selector overlay that allows users to change the active base map layer.
- **FR-022**: The base map selector MUST include OpenStreetMap Standard, OpenTopoMap, and OpenStreetMap Humanitarian, subject to attribution requirements and usage limits.
- **FR-023**: Changing the active base map layer MUST NOT clear the active callsign, current contact paths, countdown state, or selected contact details.
- **FR-024**: The system MUST display or provide access to required attribution for the active base map layer.
- **FR-025**: The system MUST display the short hash of the running code version as small low-opacity monospace text in the bottom-left corner of the map interface, using a minimal contrast fallback only when needed for readability.
- **FR-026**: The system MUST generate frontend version metadata containing the short code hash during build or startup.
- **FR-027**: The backend MUST expose the short code hash used by the running backend service.
- **FR-028**: The system MUST show a clear non-destructive error when the frontend and backend short code hashes are both available and do not match.
- **FR-029**: Required map attribution MUST take visual placement priority over the version hash when both compete for space.
- **FR-030**: On narrow/mobile viewports, simultaneous overlay panels MUST stack vertically and allow scrolling when needed without blocking core map controls.
- **FR-031**: If browser localStorage is unavailable or saving fails, the system MUST continue with an in-memory active callsign for the current session and show a non-destructive persistence warning.
- **FR-032**: Visible map contact paths MUST be directly keyboard-focusable and selectable without reintroducing a persistent contact list.

### Key Entities *(include if feature involves data)*

- **Active Callsign**: The currently selected callsign used to scope all displayed contact data and refresh requests; includes the callsign value and whether it was previously saved in browser localStorage.
- **Refresh State**: The current update status for the active callsign; includes last successful update time, next scheduled update time, countdown state, in-progress state, and any latest refresh error.
- **Map Contact**: A displayed WSPR contact represented as a selectable path on the map; includes all fields returned from the WSPRNET/WSPR API payload for that contact, including any identifiers needed to distinguish it from other contacts.
- **Selected Contact**: The map contact currently shown in the contact detail overlay; relates to one visible map contact at a time.
- **Base Map Layer**: One of the required open map backgrounds: OpenStreetMap Standard, OpenTopoMap, or OpenStreetMap Humanitarian; includes a user-facing name, attribution requirements, usage constraints, and active/inactive state.
- **Version Indicator**: A subtle display value showing the frontend short hash and backend match status for the running code versions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of first-time visitors can enter a valid callsign and see callsign-scoped map activity or a clear empty state within 10 seconds after confirming the callsign.
- **SC-002**: The map uses at least 95% of the visible browser width and height on supported desktop and mobile-sized viewports, excluding only overlay controls.
- **SC-003**: 100% of contact data requests made from the map use the currently displayed active callsign.
- **SC-004**: Users can change the active callsign from the visible callsign overlay in 3 interactions or fewer.
- **SC-005**: Automatic refresh starts within 5 seconds of the 5-minute countdown reaching zero during normal connectivity.
- **SC-006**: Manual refresh starts within 1 second after the user clicks the countdown when no refresh is already in progress.
- **SC-007**: 90% of users can open contact details from a visible map path on their first attempt during usability testing.
- **SC-008**: The persistent contact list is absent from 100% of the main map interface states, including loading, empty, error, and populated states.
- **SC-009**: 100% of returning users with a valid callsign saved in browser localStorage bypass callsign setup and load using that callsign.
- **SC-010**: Users can change the active base map layer in 3 interactions or fewer without losing current map overlays or callsign context.
- **SC-011**: 100% of loaded map views display a non-empty short version hash in the bottom-left corner without covering primary map controls.
- **SC-012**: 100% of detected frontend/backend version hash mismatches show a visible non-destructive error without blocking map interaction.
- **SC-013**: On narrow/mobile viewports, users can access every active overlay panel and core map control without horizontal scrolling.

## Assumptions

- deck.gl is a mandatory implementation constraint for rendering map overlays and selectable contact paths.
- The existing callsign validation rules remain authoritative unless changed by a later clarification or plan.
- A saved callsign only needs to persist in browser localStorage for the same browser profile or device, not across multiple devices or user accounts.
- The polling interval defaults to 5 minutes, measured from completion or failure of the latest refresh cycle.
- Existing WSPR contact data scope and result limits remain in effect unless changed by a later feature.
- Contact details shown from the map include every field returned from the WSPRNET/WSPR API payload for each displayed contact; deciding which fields to hide is out of scope for this feature.
- Required open mapping layers are OpenStreetMap Standard, OpenTopoMap, and OpenStreetMap Humanitarian, limited by attribution and usage rules that permit this application use.
- The frontend short version hash is generated into frontend metadata during build or startup and is not user-editable.
- The backend exposes its running short version hash so the frontend can flag mismatches.
