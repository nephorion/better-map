# Data Model: WSPR Callsign Activity Map

## CallsignQuery

Represents a user search for recent WSPR activity.

### Fields

- `callsign`: normalized uppercase callsign string.
- `window_days`: fixed value of `10` for this feature.
- `limit`: fixed default and maximum of `1000` records for this feature.

### Validation Rules

- Trim leading and trailing whitespace.
- Convert to uppercase.
- Reject empty input.
- Reject input shorter than 3 characters or longer than 12 characters after trimming.
- Reject input with characters outside common amateur radio callsign characters: letters, digits, and `/`.
- No application user identity is required for this query in the first version.

## WsprActivity

Represents one WSPR spot involving the searched callsign.

### Fields

- `id`: provider spot identifier when available.
- `time`: timestamp of the reported spot.
- `tx_sign`: transmitting callsign.
- `rx_sign`: receiving callsign.
- `tx_lat`: transmitter latitude.
- `tx_lon`: transmitter longitude.
- `rx_lat`: receiver latitude.
- `rx_lon`: receiver longitude.
- `distance_km`: reported distance in kilometers.
- `azimuth`: transmitter-to-receiver azimuth when available.
- `frequency_hz`: receive frequency in Hz.
- `band`: WSPR band identifier or display value when available.
- `snr_db`: reported signal-to-noise ratio.
- `power_dbm`: reported transmit power when available.
- `role`: whether the searched callsign appears as transmitter, receiver, or both.

### Validation Rules

- Exclude records without usable transmitter and receiver coordinates for path display.
- Exclude records outside the last 10 days.
- Sort by most recent first before applying the 1,000-record cap.
- Deduplicate records by provider spot identifier when available.
- Deduplicate records without provider identifiers by timestamp, transmitter callsign, receiver callsign, frequency, and endpoint coordinates.
- Preserve provider timestamps and numeric values without inventing missing data.

## MapActivityItem

Represents one map-renderable transmitter-to-receiver path in the frontend.

### Fields

- `id`: stable item identifier.
- `geometry`: LineString geometry using longitude/latitude coordinate order.
- `properties`: display details for popup/card interactions.
- `source`: data source label, initially `wspr.live`.

### Relationships

- Created from one `WsprActivity` record for the initial feature.
- Future versions may aggregate multiple `WsprActivity` records into one `MapActivityItem`.

## ActivityLookupResult

Represents the complete response for a callsign lookup.

### Fields

- `callsign`: normalized searched callsign.
- `window_days`: fixed value of `10`.
- `source`: source label.
- `count`: returned map item count.
- `truncated`: true when more than 1,000 matching records were available.
- `features`: list of `MapActivityItem` records.

## ServiceStatus

Represents local startup health for developer scripts.

### Fields

- `service`: backend, frontend, or Cloudflare tunnel/proxy.
- `status`: starting, ready, failed.
- `url`: local or tunnel URL when available.
- `message`: user-facing status or error details.

### State Rules

- Frontend startup succeeds only when both the Vite frontend and Cloudflare tunnel/proxy start successfully.
- If Cloudflare tunnel/proxy startup fails, the frontend process is stopped and a failure status is reported.
- Cloudflare startup failure states distinguish missing `cloudflared`, authentication failure, tunnel startup failure, and missing tunnel URL discovery.
