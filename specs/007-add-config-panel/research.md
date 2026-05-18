# Research: Configuration Panel

## Decisions

### Store Configuration In Browser Preferences

**Decision**: Persist user configuration in browser localStorage using the existing frontend storage pattern already used for callsign and map view preferences.

**Rationale**: The feature is user-specific, local to the browser experience, and does not require server coordination. Reusing the current persistence approach avoids backend changes and keeps configuration available across refreshes.

**Alternatives Considered**: Backend persistence was rejected because there is no account model and the feature does not need cross-device sync. Session-only state was rejected because the spec requires settings to be reusable after the configuration window closes.

### Validate MGRS Without Coordinate Conversion

**Decision**: Validate and store the user's MGRS value as a normalized string with 4-digit or 6-digit precision; do not add coordinate conversion in this feature.

**Rationale**: The specification requires accepting a user location in MGRS format and rejecting invalid values, but does not require centering the map or deriving coordinates immediately. A focused validator satisfies the current user need without introducing a geospatial dependency.

**Alternatives Considered**: Adding an MGRS conversion dependency was rejected because no current acceptance scenario requires lat/lon output. Free-form location text was rejected because it would not satisfy the MGRS validation requirements.

### Use Enumerated Band And Mode Options

**Decision**: Define static option lists for standard amateur bands and common operating mode categories in the frontend configuration service.

**Rationale**: The choices are stable domain values, need deterministic tests, and should not depend on network availability. The band list follows common amateur allocations referenced during specification, and modes cover common categories plus WSPR for future filtering.

**Alternatives Considered**: Fetching lists dynamically was rejected because it adds failure modes without user benefit. Allowing arbitrary user-entered bands/modes was rejected because WSPR filtering depends on predictable band keys.

### Filter WSPR Results On The Client By Band

**Decision**: Apply the selected band filter to the already fetched WSPR activity features before rendering map paths and empty-state messaging.

**Rationale**: WSPR activity features already include a `properties.band` value, and the feature only changes what the user sees on the map. Client-side filtering avoids backend API changes and keeps filter changes immediate.

**Alternatives Considered**: Server-side filtering was rejected for this feature because it would require API changes without reducing data requirements. Filtering by mode was rejected for current WSPRnet results because the specification explicitly states that WSPR mode should not be used as a current filter.

### Mixed Takes Precedence Over Specific Selections

**Decision**: Represent Mixed as an unfiltered state that clears or overrides specific band/mode selections in saved configuration.

**Rationale**: The spec says Mixed means no filter. Treating it as mutually exclusive avoids ambiguous UI and simplifies filtering logic.

**Alternatives Considered**: Allowing Mixed plus specific options was rejected because it creates contradictory saved state and unclear result expectations.

## Open Questions

None.
