# UI Contract: Configuration Panel

## Entry Points

- The map exposes a cog-style button at the bottom-left of the visible map interface.
- Activating the cog button opens the configuration panel.
- When no callsign has been selected on initial load, the configuration panel appears instead of the old callsign selection prompt.
- The user can dismiss the panel without losing previously saved configuration.

## Configuration Panel Fields

### Maidenhead Grid Location

- Accepts empty, 4-character Maidenhead, or 6-character Maidenhead values.
- Normalizes lowercase letters to uppercase and trims whitespace.
- Shows a clear validation error when the value is malformed or uses unsupported precision.
- Prevents saving while invalid.

### Bands

- Presents Mixed plus the standard amateur band options defined for the feature.
- Supports selecting multiple specific bands.
- Mixed is mutually exclusive with specific bands and means no band filter.
- Saved specific band selections filter visible WSPRnet map paths.

### Modes

- Presents Mixed plus the standard amateur mode options defined for the feature.
- Supports selecting multiple specific modes.
- Mixed is mutually exclusive with specific modes and means no mode filter.
- Saved mode selections do not filter current WSPRnet map paths.

## Result Behavior

- When band filtering leaves no WSPR paths, the map displays an empty state explaining that the active band filter has no matching results.
- When bands are Mixed, WSPR paths display as they do before this feature.
- Changing configuration does not reset map center, zoom, base map, grayline overlay, selected callsign, support/source links, analytics behavior, or version status.

## Accessibility And Viewports

- The panel uses dialog semantics with an accessible label.
- The cog button has an accessible name describing configuration.
- Form controls have labels.
- Save and close actions are reachable on desktop and mobile-sized viewports without horizontal scrolling.
