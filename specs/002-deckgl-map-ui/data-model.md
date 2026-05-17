# Data Model: Full-Window WSPR Map Experience

## ActiveCallsign

Represents the callsign currently used for all WSPR activity queries.

### Fields

- `value`: normalized uppercase callsign.
- `saved`: whether the value came from browser localStorage or has been saved there.
- `source`: `localStorage`, `prompt`, or `none`.

### Validation Rules

- Trim leading and trailing whitespace.
- Convert to uppercase before saving or querying.
- Reuse existing callsign validation: 3-12 characters, letters, digits, and `/`.
- Invalid saved values are ignored for querying and trigger callsign selection.

### State Transitions

- `none` → `prompted` when no valid saved callsign exists on initial load.
- `prompted` → `active` when the user confirms a valid callsign.
- `active` → `active` when the user changes to another valid callsign.
- `active` → `invalid` if a saved value fails validation on load.

## CallsignPersistence

Represents local browser persistence for the active callsign.

### Fields

- `storage_key`: stable localStorage key for the active callsign.
- `callsign`: normalized callsign value.
- `updated_at`: optional client-side timestamp for diagnostics or future migration.

### Validation Rules

- Store only the active callsign and optional metadata needed to read it safely.
- Do not store contact result payloads in localStorage for this feature.
- If localStorage is unavailable or write fails, the current session continues with an in-memory callsign and a non-destructive persistence warning; returning-user bypass is not guaranteed.

## RefreshState

Represents automatic and manual refresh behavior for the active callsign.

### Fields

- `last_success_at`: timestamp of latest successful activity load, if any.
- `last_attempt_at`: timestamp of latest attempted refresh.
- `next_refresh_at`: timestamp when the next automatic refresh should start.
- `remaining_seconds`: visible countdown value.
- `status`: `idle`, `loading`, `refreshing`, or `error`.
- `error_message`: latest non-destructive refresh error, if any.

### State Transitions

- `idle` → `refreshing` when countdown reaches zero or user clicks the countdown.
- `refreshing` → `idle` when refresh succeeds and `next_refresh_at` is reset to five minutes after completion.
- `refreshing` → `error` when refresh fails and previous successful map data remains visible.
- `error` → `refreshing` on the next scheduled or manual retry.

## MapContact

Represents a displayed WSPR contact path rendered through deck.gl.

### Fields

- `id`: stable feature identifier.
- `coordinates`: transmitter-to-receiver longitude/latitude coordinate pair.
- `properties`: all WSPRNET/WSPR API payload fields returned for the displayed contact.
- `is_selected`: whether this contact is shown in the details overlay.

### Validation Rules

- Only contacts with usable transmitter and receiver coordinates are rendered as paths.
- Preserve all WSPRNET/WSPR API payload fields returned for the displayed contact in the details overlay.
- If a selected contact is absent from refreshed results, clear the selection and close the details overlay.

## BaseMapLayer

Represents one selectable required open base map layer.

### Fields

- `id`: stable layer identifier.
- `name`: user-facing layer name.
- `source`: tile URL template or style source.
- `attribution`: required attribution text or link.
- `usage_notes`: relevant usage limits or caveats.
- `is_default`: whether this is the initial layer.
- `status`: `available`, `active`, `failed`, or `disabled`.

### Validation Rules

- Include OpenStreetMap Standard, OpenTopoMap, and OpenStreetMap Humanitarian when their attribution and usage rules permit this app use.
- Show or provide access to attribution for the active layer.
- If the active layer fails, keep WSPR overlays available and let the user choose another available layer.
- Required attribution takes placement priority over the version indicator if both compete for space.

## SelectedContact

Represents the contact currently shown in the overlay details panel.

### Fields

- `contact_id`: selected `MapContact.id`.
- `properties`: all WSPRNET/WSPR API payload fields returned for the selected contact.
- `opened_at`: timestamp when the panel opened.

### State Transitions

- `none` → `selected` when the user clicks a map path.
- `selected` → `selected` when the user clicks another path.
- `selected` → `none` when the user closes the panel or refreshed results omit the selected contact.

## VersionIndicator

Represents the visible short hash of the running frontend code version and backend match status.

### Fields

- `short_hash`: non-empty abbreviated code revision hash.
- `backend_short_hash`: abbreviated backend code revision hash when available.
- `mismatch`: whether frontend and backend hashes are both available and different.
- `position`: bottom-left unless required map attribution needs that space.
- `visibility`: subtle but readable overlay state.

### Validation Rules

- Display a non-empty frontend short hash whenever the map view is loaded.
- Do not allow the version indicator to cover primary map controls, required attribution, or interaction targets.
- Treat hash values as build/runtime metadata, not user-editable application data.
- Flag a non-destructive error when frontend and backend short hashes are both available and different.
