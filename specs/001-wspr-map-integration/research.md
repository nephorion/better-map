# Research: WSPR Callsign Activity Map

## Decision: Use WSPR.live as the initial WSPR-compatible data source

**Rationale**: WSPR.live exposes a public read-only ClickHouse HTTP interface backed by WSPRnet spot data. It documents the `wspr.rx` table, latitude/longitude columns, JSON output formats, and Python/browser access examples. It is a better first WSPR-compatible integration target than scraping WSPRnet pages because it is designed for query access and already contains map-ready coordinates.

**Alternatives considered**:

- Direct WSPRnet scraping: rejected for first implementation because it is more fragile and less contributor-friendly.
- WSPRnet CSV export workflows: useful for bulk or historical import, but heavier than needed for a 10-day callsign lookup.
- Manual sample fixtures only: useful for tests, but does not satisfy the real feature.

**Operating assumptions**: WSPR.live is volunteer-operated and publicly accessible without authentication. The app must respect published access limits, must handle rate limits and downtime gracefully, and must not rely on guaranteed availability. This first feature is intended for free/non-commercial access patterns.

## Decision: Query both transmitter and receiver callsign roles

**Rationale**: Users expect "activity for this callsign" to include cases where the station transmitted and where it received. The WSPR.live `rx` table contains `tx_sign` and `rx_sign`, so both roles can be queried.

**Alternatives considered**:

- Transmitter-only lookup: simpler but incomplete.
- Receiver-only lookup: similarly incomplete.

## Decision: Cap results to the most recent 1,000 records

**Rationale**: Ten days of WSPR activity can produce a large result set. The clarified requirement is to show the most recent 1,000 spots and indicate truncation. This protects the map experience, keeps queries bounded, and gives deterministic test expectations.

**Alternatives considered**:

- Show all spots: rejected because it risks poor map performance and abusive external queries.
- Aggregate by location/path: valuable later, but more complex than needed for first implementation.
- Ask the user to narrow the search: rejected because the first feature has a fixed 10-day scope.

## Decision: Return provider-neutral path features from the backend

**Rationale**: The first map view should render lines between transmitter and receiver. The backend should transform WSPR rows into provider-neutral LineString features so the frontend does not depend on WSPR.live column names.

**Alternatives considered**:

- Provider-specific row arrays: rejected because they leak data-source details into the UI.
- Point-only features: rejected because the clarified map representation is transmitter-to-receiver paths.
- Server-rendered map tiles: too complex for the first feature.

## Decision: Prefer MapLibre GL JS for the first map renderer

**Rationale**: The project vision calls for the map to be the killer experience. MapLibre GL JS provides a modern WebGL renderer, strong interactivity, line-layer support, and room for attractive styling.

**Alternatives considered**:

- Leaflet: easier and mature, but less aligned with a polished, high-performance line-based map experience.
- Static map image: rejected because the feature requires interactive exploration.

## Decision: No application login for first-version callsign search

**Rationale**: Public WSPR activity can be searched without creating app accounts, which keeps the casual-user experience low friction.

**Alternatives considered**:

- Require login before search: rejected as unnecessary friction for public data.
- Hide searched callsigns from logs as a first-class requirement: useful later, but not requested for the first feature.

## Decision: Enforce a 10-second provider timeout

**Rationale**: A 10-second limit gives slow public-data lookups enough time while ensuring users are not left waiting indefinitely. The UI must show a clear timeout message within that window.

**Alternatives considered**:

- 5 seconds: may be too aggressive for a public external data source.
- 30 seconds or no timeout: too slow for the intended easy UX.

## Decision: Use root shell scripts for local service startup

**Rationale**: Root scripts provide the easiest contributor experience and match the feature requirement. `scripts/start-backend.sh` will start the FastAPI backend; `scripts/start-frontend.sh` will start Vite and require a successful Cloudflare tunnel/proxy process.

**Alternatives considered**:

- Document manual commands only: rejected because the requirement explicitly asks for scripts.
- Use a process manager immediately: unnecessary complexity for the first feature.

## Decision: Treat Cloudflare tunnel/proxy failure as a frontend startup failure

**Rationale**: The clarified requirement is that the frontend script stops the frontend if the tunnel/proxy cannot start. This makes startup behavior deterministic and reinforces that the Cloudflare-accessible URL is part of the expected local workflow.

**Alternatives considered**:

- Keep frontend running with a warning: contributor-friendly, but rejected by clarification.
- Retry indefinitely: rejected because it can hang without actionable feedback.
- Skip Cloudflare silently: rejected because it violates the feature requirement.
