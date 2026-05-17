# UI Contract: Analytics, Donations, Nephorion Link, and Version Hash Fix

## Main Page Load

**Given** a visitor opens Better Map in a browser session that allows analytics, **when** the app loads, **then** Google Analytics receives the default page-view measurement for `G-PZ4DB72GNK`.

**Given** analytics is blocked or unavailable, **when** the app loads, **then** the map remains usable and no analytics-specific visible error is shown.

**Given** a visitor enters or changes a callsign or interacts with the map, **when** those interactions occur, **then** this feature does not emit custom analytics events for those interactions.

## Donation Control

**Given** the main map page is visible, **when** the visitor scans supporting controls, **then** a custom subtle Better Map donation button is available and visually secondary to primary map controls and required attribution.

**Given** the visitor activates the donation button, **when** the donation flow opens, **then** an in-page Ko-fi pane for `https://ko-fi.com/museofnephorion` appears without replacing the active map page.

**Given** the Ko-fi pane is open, **when** the visitor dismisses it, **then** the pane closes without reloading the map, changing the active callsign, changing the base map, or clearing selected map state.

**Given** the Ko-fi resource cannot load, **when** the visitor opens the pane, **then** Better Map remains usable and provides a non-blocking failure state or fallback path.

## Nephorion Link

**Given** the main map page is visible, **when** the visitor scans supporting information, **then** a subtle Nephorion link is present with an understandable external-destination label.

**Given** the visitor activates the Nephorion link, **when** navigation occurs, **then** `https://nephorion.com` opens in a new browser tab/window and the original Better Map page remains available.

## Version Indicator

**Given** Better Map is deployed on Railway from a known commit, **when** the deployed page loads, **then** the visible frontend version indicator shows a short commit hash and not `dev`.

**Given** the backend version endpoint returns the same short hash as the frontend, **when** version metadata loads, **then** no mismatch warning is shown.

**Given** the backend version endpoint returns a different short hash than the frontend, **when** version metadata loads, **then** a non-blocking mismatch warning is shown and the map remains usable.

**Given** version metadata cannot be resolved in a local/non-production run, **when** the app loads, **then** the version indicator may show `dev` and map functionality remains available.

## Responsive Layout

**Given** a desktop or mobile-sized viewport, **when** all map overlays are visible, **then** analytics has no visible UI, the donation control and Nephorion link remain reachable, and neither obscures required map attribution, refresh controls, callsign controls, or critical status messages.
