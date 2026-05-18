# Data Model: Update Grayline Terminator

## Grayline Terminator

Represents the current day/night transition overlay shown on the WSPR map.

**Fields**:

- `observationTime`: Current time used to calculate the overlay.
- `boundaryCoordinates`: Ordered geographic coordinates for the transition boundary.
- `darknessRegion`: Geographic area representing current darkness.
- `daylightRegion`: Geographic area representing current daylight, if separately represented for styling.
- `lastUpdatedAt`: Time when the overlay data was last refreshed.

**Validation Rules**:

- `observationTime` must be derived at refresh time, not cached from initial page load.
- Coordinates must stay within valid longitude and latitude ranges.
- Generated geometry must remain usable near high latitudes and the international date line.
- Overlay data must be replaceable without changing WSPR path data or map view state.

## Refresh Cadence

Represents the recurring update rule for visible map sessions.

**Fields**:

- `intervalMinutes`: Fixed value of 5 minutes for visible sessions.
- `visibilityMode`: Whether the map session is visible or hidden/backgrounded.
- `nextRefreshAt`: Expected next visible-session refresh time.

**Validation Rules**:

- Visible sessions must refresh at least once every 5 minutes.
- Hidden/backgrounded sessions must refresh immediately when visible again.
- Refresh cadence must not produce constant animation.

## Observation Time

Represents the time basis used for each grayline calculation.

**Fields**:

- `currentTime`: Device current time captured for a specific refresh.
- `source`: Device clock.

**Validation Rules**:

- Each refresh must capture a new current time.
- Device clock changes must be reflected on the next scheduled or visibility-return refresh.

## State Transitions

```text
Initial Load -> Visible Refresh Scheduled -> Refreshed Every 5 Minutes
Visible Refresh Scheduled -> Hidden/Backgrounded -> Visible Return Refresh -> Visible Refresh Scheduled
Any Refresh -> Refresh Failed -> Existing Overlay Preserved -> Next Refresh Attempt
```

## Relationships

- A `Grayline Terminator` is generated from one `Observation Time`.
- A `Refresh Cadence` determines when a new `Observation Time` is captured.
- A failed refresh must not modify existing WSPR paths, selected callsign, selected base map, map view, or open controls.
