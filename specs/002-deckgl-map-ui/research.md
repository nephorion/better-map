# Research: Full-Window WSPR Map Experience

## Decision: Use deck.gl for WSPR path overlays on the existing map foundation

**Rationale**: The specification makes deck.gl mandatory for selectable contact paths. The current frontend already uses MapLibre GL for the base map, so the lowest-risk approach is to keep MapLibre for open raster/vector base layers and render WSPR paths through deck.gl layers above it. This preserves existing map behavior while satisfying the deck.gl requirement.

**Alternatives considered**: Replacing the entire map with a deck.gl-only view was rejected because base map controls, attribution, and open tile layer support are already available through the current map foundation. Keeping MapLibre line layers was rejected because it fails the mandatory deck.gl constraint.

## Decision: Keep the existing WSPR activity API unchanged

**Rationale**: The existing API already returns GeoJSON LineString features with all properties needed for map paths and contact details. The new behavior changes frontend presentation, polling, state persistence, and layer selection rather than server-side data shape.

**Alternatives considered**: Adding a backend endpoint for map-layer configuration was rejected for this feature because the standard open layer set can be frontend configuration subject to documented attribution and usage limits. Adding server-side callsign persistence was rejected because the spec explicitly requires browser localStorage.

## Decision: Persist only the active callsign in browser localStorage

**Rationale**: The user requested localStorage so returning users bypass setup on the same device/browser profile. Callsigns are public radio identifiers in this context, but persistence should remain minimal and avoid storing contact data or user identifiers beyond the selected callsign.

**Alternatives considered**: Session storage was rejected because it would not persist across browser restarts. Server persistence was rejected because there are no user accounts and cross-device sync is out of scope.

## Decision: Use a five-minute refresh countdown measured after refresh completion or failure

**Rationale**: This matches the clarified specification and prevents overlapping refreshes. Resetting after completion gives users a predictable full interval between displayed refresh attempts and simplifies tests for loading, failure, and countdown reset states.

**Alternatives considered**: Measuring from refresh start was rejected because slow requests would shorten the visible interval and increase overlap pressure. Fixed wall-clock intervals were rejected because they make user-visible countdown behavior harder to explain.

## Decision: Provide a frontend-configured base map layer catalog of suitable open layers

**Rationale**: The clarified spec requires OpenStreetMap Standard, OpenTopoMap, and OpenStreetMap Humanitarian, subject to attribution and usage limits. The catalog should document each included layer's name, tile URL/style source, attribution text, and usage caveat.

**Alternatives considered**: A single OpenStreetMap layer was rejected because the user explicitly asked for changing the base map. A broader open-layer catalog was rejected for the initial implementation to keep attribution and usage validation bounded.

## Decision: Remove the persistent contact list and use map-path selection plus overlay details

**Rationale**: The specification explicitly removes the contact list. Contact inspection should start from visible deck.gl paths; the detail panel then shows all WSPRNET/WSPR API payload fields for the selected displayed contact.

**Alternatives considered**: Keeping a hidden or secondary list was rejected because it risks preserving the old UI pattern and conflicts with the absence of a persistent contact list. A popup-only design was rejected because the full WSPRNET/WSPR payload may require more readable space than a small map popup.

## Decision: Preserve previous successful paths on refresh failure

**Rationale**: This maintains map utility during transient provider/network failures and is already established by the prior WSPR feature. The UI should clearly communicate failed refresh state without clearing successful results.

**Alternatives considered**: Clearing paths on failure was rejected because it makes transient errors look like no activity exists. Blocking the whole map during refresh was rejected because it degrades monitoring and path inspection.
