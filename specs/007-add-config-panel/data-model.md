# Data Model: Configuration Panel

## User Configuration

Represents the user's map configuration preferences stored in the browser.

**Fields**:

- `locationGrid`: normalized Maidenhead grid locator string, or empty when not provided.
- `bandSelection`: either Mixed or a non-empty set of selected band identifiers.
- `modeSelection`: either Mixed or a non-empty set of selected mode identifiers.

**Validation Rules**:

- `locationGrid` is valid when empty or when it matches a 4-character or 6-character Maidenhead grid locator.
- Mixed band selection means no band filter and must not be stored together with specific band identifiers.
- Mixed mode selection means no mode filter and must not be stored together with specific mode identifiers.
- Unknown stored band or mode identifiers are ignored during read and normalized back to Mixed if no valid specific selections remain.

**Lifecycle**:

1. Default configuration starts with empty location, Mixed bands, and Mixed modes.
2. User opens configuration from first-run prompt or the cog control.
3. User edits fields and saves valid configuration.
4. Saved configuration is read on future map loads.
5. User can reopen configuration and replace saved values at any time.

## Band Preference

Represents the user's WSPR band filter intent.

**Fields**:

- `kind`: Mixed or Specific.
- `bands`: selected standard amateur band identifiers when `kind` is Specific.

**Relationships**:

- Used by WSPR filtering to include features with matching `WSPRnet Result.properties.band` values.
- Does not affect mode preferences.

## Mode Preference

Represents the user's current or future mode filter intent.

**Fields**:

- `kind`: Mixed or Specific.
- `modes`: selected standard amateur mode identifiers when `kind` is Specific.

**Relationships**:

- Saved with User Configuration.
- Not applied to WSPRnet Result filtering in this feature.

## WSPRnet Result

Represents an activity feature returned by the existing WSPR lookup.

**Fields Used By This Feature**:

- `id`: unique result identifier.
- `properties.band`: nullable band label used for filtering.
- `geometry.coordinates`: path coordinates rendered on the map.

**Filtering Rules**:

- If Band Preference is Mixed, include all results.
- If Band Preference is Specific, include only results whose normalized band matches a selected band.
- If a result has an unknown or missing band, include it only when Band Preference is Mixed.
