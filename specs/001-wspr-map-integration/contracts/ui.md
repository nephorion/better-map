# UI Contract: WSPR Callsign Activity Map

## Main Map View

### Required Elements

- Prominent callsign search input.
- Search trigger via Enter key and visible button.
- Interactive map that can pan and zoom.
- Transmitter-to-receiver path lines for returned WSPR activity.
- Loading state while activity is being fetched.
- Empty state when no activity is found.
- Error state when the lookup fails.
- Timeout state when lookup exceeds 10 seconds.
- Truncation notice when only the most recent 1,000 records are displayed.
- Details popup or side panel for selected activity path.

### Accessibility Requirements

- Callsign input and search action have accessible labels.
- Search can be completed using only keyboard input.
- Loading, empty, error, timeout, rate-limit, and truncation messages are announced to assistive technology.
- Selected activity details are reachable by keyboard.
- Map controls do not trap keyboard focus.

## Search Behavior

- User input is trimmed and displayed in normalized uppercase after search.
- Invalid callsign input shows inline guidance without querying the backend.
- A new search replaces existing map activity.
- Search does not require login or account creation.
- Failed, timed-out, or rate-limited searches preserve previous successful map activity while showing a non-destructive message.

## Map Behavior

- Results are plotted as lines from transmitter location to receiver location.
- The map view adjusts to show returned activity when possible.
- Selecting a path exposes timestamp, transmitter, receiver, distance, signal strength, and band/frequency.
- If result volume is truncated, the UI must tell the user that only the most recent 1,000 records are visible.

## Local Startup Behavior

- Backend script reports the backend URL.
- Frontend script reports the frontend URL and Cloudflare tunnel/proxy URL when startup succeeds.
- If the Cloudflare tunnel/proxy cannot start, the frontend script stops the frontend process and prints an actionable failure reason.
- Cloudflare startup messages distinguish missing `cloudflared`, authentication failure, tunnel startup failure, and missing tunnel URL discovery.
