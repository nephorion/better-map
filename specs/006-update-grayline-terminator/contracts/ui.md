# UI Contract: Update Grayline Terminator

## Current Grayline Display

**Given** a user opens the WSPR map, **when** the map becomes available, **then** a subtle grayline terminator overlay is shown as contextual information and remains visually subordinate to WSPR paths and controls.

**Given** WSPR paths are visible, **when** the grayline overlay is shown, **then** WSPR paths, selected path details, labels, attribution, callsign controls, refresh controls, support links, and version status remain readable and usable on desktop and mobile-sized viewports.

## Visible-Session Refresh

**Given** the map is visible, **when** 5 minutes pass, **then** the grayline refreshes using the current time.

**Given** the map remains open for 30 minutes, **when** the session stays visible, **then** at least 6 grayline refreshes occur without a page reload.

## Visibility Return Refresh

**Given** the map session is hidden or backgrounded for at least 5 minutes, **when** the user returns to the visible map, **then** the grayline refresh is requested within 1 second before waiting for the next scheduled interval.

**Given** the map session is hidden or backgrounded for less than 5 minutes, **when** the user returns to the visible map, **then** the grayline may continue the existing visible-session schedule unless the overlay is already at least 5 minutes stale.

**Given** the device wakes from sleep or the device clock changes, **when** the next scheduled or visibility-return refresh occurs, **then** the grayline reflects the current device time.

## State Preservation

**Given** a grayline refresh occurs, **when** the user has selected a callsign, base map, map position, WSPR path, or open control, **then** those states remain unchanged by the refresh.

**Given** the user is panning, zooming, using callsign controls, using refresh controls, viewing support links, or viewing version status, **when** a grayline refresh occurs, **then** focus is not stolen, controls are not dismissed, and map position and zoom are not reset.

**Given** analytics are enabled, **when** a grayline refresh, visibility-return refresh, or refresh failure occurs, **then** no custom analytics event is emitted for that grayline behavior.

## Failure Handling

**Given** a grayline refresh cannot complete, **when** the failure occurs, **then** the main map remains usable and no disruptive grayline-specific error is shown.

**Given** one or more grayline refresh attempts fail, **when** a later scheduled or visibility-return refresh occurs, **then** the system can attempt to refresh the grayline again while preserving the previous overlay if present.

## Scope Boundaries

**Given** the grayline overlay is available, **when** a user views the map, **then** no historical playback, future-time preview, manual time control, or propagation prediction control is introduced by this feature.
