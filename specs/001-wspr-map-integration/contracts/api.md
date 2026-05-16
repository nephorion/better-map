# API Contract: WSPR Callsign Activity Map

## GET `/api/wspr/activity`

Fetch recent public WSPR activity for a callsign from a WSPR-compatible data provider, initially WSPR.live.

### Query Parameters

- `callsign` (required): amateur radio callsign to search.

### Server Rules

- Search window is fixed to the last 10 days for this feature.
- Search matches both transmitter and receiver callsign roles.
- Returned records are sorted most recent first.
- Returned records are capped at 1,000.
- Provider lookup timeout is 10 seconds.
- No application login or user account is required.
- Callsigns may be logged for troubleshooting, but logs must not include user IP addresses or browser identifiers.
- Duplicate records are removed before response generation.

### Success Response: `200 OK`

```json
{
  "callsign": "VK2DJJ",
  "window_days": 10,
  "source": "wspr.live",
  "count": 1,
  "truncated": false,
  "features": [
    {
      "id": "123456",
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [[151.2, -33.8], [144.9, -37.8]]
      },
      "properties": {
        "time": "2026-05-16T10:30:00Z",
        "tx_sign": "VK2DJJ",
        "rx_sign": "VK3ABC",
        "distance_km": 713,
        "frequency_hz": 14095600,
        "band": "20m",
        "snr_db": -18,
        "power_dbm": 30,
        "role": "transmitter"
      }
    }
  ]
}
```

### Truncated Response: `200 OK`

```json
{
  "callsign": "VK2DJJ",
  "window_days": 10,
  "source": "wspr.live",
  "count": 1000,
  "truncated": true,
  "features": []
}
```

### Empty Response: `200 OK`

```json
{
  "callsign": "VK2DJJ",
  "window_days": 10,
  "source": "wspr.live",
  "count": 0,
  "truncated": false,
  "features": []
}
```

### Error Responses

- `400 Bad Request`: callsign is empty or invalid.
- `429 Too Many Requests`: WSPR-compatible data provider rate limit prevents the lookup from completing.
- `502 Bad Gateway`: WSPR-compatible data provider is unavailable or returned an unusable response.
- `504 Gateway Timeout`: WSPR-compatible data provider did not respond within 10 seconds.

### Observability Events

- Provider timeout.
- Provider rate limit.
- Provider unavailable.
- Invalid provider data.
- Result truncation.

### Contract Notes

- The frontend must not depend on WSPR.live column names.
- Coordinates use longitude/latitude order for map compatibility.
- `features` must contain LineString geometries between transmitter and receiver locations.
- If `truncated` is true, the UI must explain that only the most recent 1,000 records are shown.
