# UI Contract: Full-Window Deck.gl WSPR Map

## Main Layout

### Required Elements

- Map fills the visible browser window with no outer app frame, border, or persistent contact-list column.
- WSPR contact paths render as selectable deck.gl overlays above the active base map.
- Overlay controls remain on top of the map and do not require horizontal page scrolling on mobile-sized viewports.
- Persistent contact list is absent in loading, empty, error, and populated states.

### Required Overlay Controls

- Active callsign panel on the right when a valid callsign is active.
- Persistent `Set Callsign` control when no valid callsign is active and the callsign prompt is closed.
- Countdown/manual refresh control when a valid callsign is active.
- Base map selector with clear names for OpenStreetMap Standard, OpenTopoMap, and OpenStreetMap Humanitarian.
- Contact details panel when a path is selected.
- Subtle code-version short hash in the bottom-left corner.
- Non-destructive status messaging for loading, empty results, truncation, refresh failure, and base-map failure.

## Callsign Flow

- On first load with no valid localStorage callsign, show a callsign prompt before any callsign-scoped request.
- Confirming a valid callsign normalizes it, saves it to localStorage, closes the prompt, and loads activity for that callsign.
- Returning users with a valid localStorage callsign bypass setup and immediately load with that callsign.
- Clicking the active callsign overlay reopens callsign selection.
- Changing callsign refreshes map data for the new callsign and updates the overlay.
- Invalid saved callsigns are ignored for querying and route the user back to callsign selection.
- If localStorage is unavailable or saving fails, the session still allows callsign entry with an in-memory active callsign and shows a non-destructive warning that returning-user setup may not persist.

## Refresh Flow

- Countdown displays the remaining time until the next automatic refresh as a compact top-right `mm:ss` overlay button.
- Countdown defaults to five minutes after each refresh succeeds or fails.
- Clicking the countdown starts an immediate refresh when no refresh is already in progress.
- Duplicate overlapping refreshes for the same active callsign are prevented.
- Failed refreshes preserve previous successful paths and display a clear non-destructive error.
- Changing callsign resets refresh state for the new callsign.

## Base Map Layer Flow

- Base map selector lists OpenStreetMap Standard, OpenTopoMap, and OpenStreetMap Humanitarian.
- Each layer has a clear user-facing name.
- Selecting a layer changes only the map background.
- Changing layer does not clear active callsign, contact paths, countdown state, or selected contact details.
- Required attribution for the active base map layer is visible or accessible.
- Required attribution takes placement priority over the version hash if both compete for space.
- If a selected base layer fails to load, the UI keeps contact overlays available and offers another available layer when possible.

## Contact Path Flow

- Selecting a visible deck.gl contact path opens a details panel over the map.
- Visible deck.gl contact paths are directly keyboard-focusable and selectable without adding a persistent contact list.
- Selecting another path updates the same details panel.
- Details panel shows all WSPRNET/WSPR API payload fields returned for the selected displayed contact.
- Closing the details panel returns to the full map view without clearing paths.
- If refreshed results no longer include the selected contact, the details panel closes.

## Version Indicator Flow

- Frontend short code-version hash is visible as small low-opacity monospace text in the bottom-left corner whenever the map view is loaded unless required attribution needs that space.
- Version indicator remains subtle and does not block required attribution, primary map controls, overlay controls, or path selection.
- Version indicator value is not user-editable.
- Backend short code-version hash is compared with the frontend hash when available.
- A frontend/backend version mismatch is presented as a clear non-destructive error.

## Accessibility Requirements

- Callsign prompt, callsign overlay, Set Callsign control, countdown refresh control, base map selector, and contact details panel have accessible names.
- Callsign entry and base map selection can be completed using keyboard input.
- Loading, empty, error, truncation, refresh failure, and base map failure messages are announced to assistive technology.
- Map controls and overlay panels do not trap keyboard focus.
- Contact details remain reachable through direct keyboard focus and activation of map paths without relying solely on pointer hover or pointer click.

## Responsive Overlay Requirements

- On narrow/mobile viewports, simultaneous overlay panels stack vertically and allow scrolling when needed.
- Stacked overlays must not require horizontal page scrolling.
- Core map controls remain accessible when overlays are stacked.

## Test Expectations

- First-time user prompt appears before activity query.
- Valid localStorage callsign bypasses setup on return.
- Invalid localStorage callsign does not query and prompts for selection.
- Map occupies at least 95% visible width and height excluding overlays.
- deck.gl path layer is used for contact path rendering.
- Manual refresh starts within 1 second when idle.
- Automatic refresh starts within 5 seconds of countdown reaching zero.
- Countdown is specified as a compact top-right `mm:ss` overlay button.
- Base map can be changed in 3 interactions or fewer.
- Current overlays and callsign context survive base map changes.
- Persistent contact list is not rendered.
- Bottom-left version indicator displays a non-empty short hash.
- Version hash styling is specified as small low-opacity monospace text with contrast fallback when needed.
- Frontend/backend version mismatch requirements are defined as a non-destructive error state.
- LocalStorage failure requirements define session-only continuation with a non-destructive warning.
- Mobile overlay stacking requirements define vertical stacking, scrolling when needed, and no horizontal scrolling.
- Map path accessibility requirements define direct keyboard focus and selection.

## Implementation Coverage Review

- Covered by frontend service/component/application tests: callsign persistence and recovery, full-window map shell, deck.gl path rendering and selection, keyboard path selection, base map selection, countdown/manual/automatic refresh behavior, all-field details rendering, localStorage failure warning, and version mismatch status.
- Covered by backend contract tests: short version hash endpoint and fallback behavior.
