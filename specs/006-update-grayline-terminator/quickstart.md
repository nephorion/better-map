# Quickstart: Update Grayline Terminator

## Implementation Checklist

- Add a focused terminator calculation service with deterministic fixed-time tests.
- Render the grayline terminator overlay in the existing map overlay behind WSPR paths.
- Refresh the overlay every 5 minutes while the map is visible.
- Request a refresh within 1 second when a hidden/backgrounded map becomes visible again and the overlay is at least 5 minutes stale.
- Preserve map position, zoom, selected callsign, base map, WSPR paths, selected path details, controls, support links, analytics behavior, and version status during refreshes.
- Avoid custom analytics events for grayline refresh behavior.
- Validate desktop and mobile-sized viewports.
- Keep failure handling non-disruptive and recoverable on future refreshes.

## Verification Commands

From `frontend/`:

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run test:e2e
npm run build
```

## Manual Smoke Check

1. Open the app and set a callsign with visible WSPR paths.
2. Confirm the grayline terminator overlay is visible, subtle, and behind WSPR paths.
3. Confirm paths, selected path details, controls, attribution, support links, and version status remain readable on desktop and mobile-sized views.
4. Leave the map visible long enough for a scheduled refresh, or use test controls/fake time during development.
5. Background the tab, return after the refresh interval, and confirm the grayline catch-up refresh is requested within 1 second.
6. Confirm map position, zoom, selected base map, callsign, selected path details, visible WSPR data, controls, support links, analytics behavior, and version status are unchanged after refresh.

## Expected Results

- The grayline updates at least every 5 minutes while visible.
- A hidden/backgrounded session with an overlay at least 5 minutes stale requests refresh within 1 second on visibility return.
- The overlay does not animate constantly.
- Core map workflows remain unchanged.
- No backend behavior changes are required.
