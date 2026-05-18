# UI Contract: AGPL §13 Source Link

## In-App Source Link Visibility

**Given** a user opens the hosted WSPR map, **when** the map shell renders, **then** a visible link labeled "Source" pointing to the canonical project source repository is present in the overlay stack alongside the existing Nephorion link, donation control, and version hash.

**Given** WSPR paths, callsign controls, base-map selector, refresh controls, support links, and version status are present, **when** the SourceLink renders, **then** none of those existing controls are visually obscured, repositioned outside their existing overlay region, or made unreachable.

## Accessibility

**Given** a screen reader user navigates the map, **when** focus reaches the SourceLink, **then** the link announces an accessible name including the phrase "source code" so the AGPL §13 source offer is discoverable non-visually.

**Given** a keyboard-only user tabs through the page, **when** the SourceLink receives focus, **then** it has a visible focus indicator consistent with other overlay links.

## Behavior on Activation

**Given** the user clicks or activates the SourceLink, **when** the link is followed, **then** the user reaches the canonical source repository URL (`https://github.com/nephorion/better-map`) in a new browser context (target `_blank` with `rel="noreferrer"`), and the map application state in the originating tab (callsign, base map, map position, zoom, selected WSPR path, controls) remains unchanged.

## Refresh and Re-render Preservation

**Given** the WSPR data refreshes, the grayline overlay refreshes, or the base map changes, **when** the SourceLink re-renders, **then** its label, target URL, and accessibility name remain stable across re-renders.

## Responsive Coverage

**Given** the map is viewed on a desktop-sized viewport, **when** the SourceLink renders, **then** it is visible without scrolling away from the default map view.

**Given** the map is viewed on a mobile-sized viewport (e.g., 390×844), **when** the SourceLink renders, **then** it remains visible and reachable, and does not cover the primary refresh, callsign, base-map, or grayline controls.

## Failure Behavior

**Given** the link cannot be activated for any external reason (offline, browser blocks `_blank`, etc.), **when** the failure occurs, **then** the running map remains fully usable and no disruptive error is shown.

## Scope Boundaries

**Given** the AGPL v3 license is in force, **when** a user views the map, **then** the SourceLink is the only new UI element introduced by this feature; no in-app license-text viewer, no copyright-notice modal, and no contributor agreement prompt is added.
