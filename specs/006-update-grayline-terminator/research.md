# Phase 0 Research: Update Grayline Terminator

## Terminator Calculation

**Decision**: Calculate the current day/night terminator in the frontend from the current observation time using a deterministic astronomical approximation, with no network request or new production dependency.

**Rationale**: The feature only needs contextual map-scale propagation guidance, not scientific-grade ephemeris precision. A local deterministic calculation is fast, testable with fixed timestamps, resilient offline after app load, and avoids adding failure modes or package weight.

**Alternatives considered**: External day/night API was rejected because it adds latency and network failure risk for data that can be calculated locally. A new astronomy dependency was rejected because the required precision is modest and the project can cover a small focused calculation with tests.

## Overlay Rendering

**Decision**: Render the grayline as an additional deck.gl layer in the existing map overlay, ordered behind WSPR paths and styled with subtle translucent day/night or boundary treatment.

**Rationale**: The existing map already uses deck.gl for path rendering through MapboxOverlay. Adding the terminator to the same overlay keeps map alignment consistent during pan/zoom and avoids mixing separate rendering systems.

**Alternatives considered**: MapLibre style layers were considered but would require managing generated GeoJSON sources across base style changes. A DOM/SVG overlay was rejected because it is harder to keep geographically aligned with map pan and zoom.

## Refresh Cadence

**Decision**: Refresh the observation time and derived grayline geometry every 5 minutes while the document is visible.

**Rationale**: Five minutes satisfies the spec's freshness target and produces visible movement during long sessions without constant animation or unnecessary rendering. It also aligns with the existing app's preference for periodic, non-blocking updates.

**Alternatives considered**: One-minute updates were rejected as unnecessary for a subtle contextual layer. Fifteen-minute updates were rejected because they would not meet the 30-minute success criterion of at least 6 updates.

## Visibility Return Behavior

**Decision**: Refresh immediately when a hidden or backgrounded session becomes visible again, then continue the visible-session cadence.

**Rationale**: Browser timer throttling can delay hidden-tab updates. Refreshing on visibility return ensures a user sees current day/night context without waiting for the next scheduled interval while still conserving resources in hidden tabs.

**Alternatives considered**: Continuing timers while hidden was rejected because browsers may throttle it and it wastes work. Waiting for the next interval after visibility return was rejected because it could display stale context at the exact moment the user resumes viewing.

## Failure Handling

**Decision**: Treat grayline calculation/render failures as non-critical: keep the map and existing WSPR paths usable, and allow later refreshes to recover.

**Rationale**: The overlay is contextual, while map navigation and WSPR activity display are core functionality. A failed overlay update must not disrupt primary workflows.

**Alternatives considered**: Showing a visible error was rejected because it would distract users for non-core contextual information. Disabling future updates after one failure was rejected because transient failures should recover.

## Test Strategy

**Decision**: Cover terminator geometry with fixed-time unit tests, WsprMap refresh behavior with fake timers and visibility events, preservation of map/deck state with component tests, and map usability with existing Playwright UI coverage.

**Rationale**: The feature's risks are time-dependent behavior, map-state preservation, and visual layer ordering. Focused automated tests can verify these without requiring multi-hour real-time test runs.

**Alternatives considered**: Manual long-running verification alone was rejected because the constitution requires automated tests and 100% coverage. Real-time 30-minute automated tests were rejected because fake timers provide deterministic and faster coverage.
