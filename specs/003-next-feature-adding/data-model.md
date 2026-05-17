# Data Model: Analytics, Donations, Nephorion Link, and Version Hash Fix

## Analytics Measurement

**Purpose**: Represents the default page-view usage measurement for Better Map.

**Fields**:

- `measurementId`: Fixed value `G-PZ4DB72GNK`.
- `trackingScope`: Fixed value `default-page-view-only`.
- `enabledOnLoad`: Boolean requirement; true for normal app loads.

**Validation Rules**:

- Measurement ID must be non-empty and must match the provided ID.
- No custom event names or payloads are part of this feature.
- Analytics failure must not produce visible app errors or block map use.

## Donation Affordance

**Purpose**: Represents the subtle Better Map control used to open the Ko-fi donation pane.

**Fields**:

- `label`: User-facing donation label that makes the Ko-fi destination understandable.
- `koFiPageUrl`: Fixed value `https://ko-fi.com/museofnephorion`.
- `visualPriority`: Fixed value `secondary` relative to map controls and attribution.
- `paneState`: `closed` or `open`.

**Validation Rules**:

- The entry point must be a custom Better Map control, not Ko-fi's default floating widget button.
- The control must be reachable on desktop and mobile-sized viewports.
- The pane must be dismissible without reloading Better Map or changing map state.

**State Transitions**:

- `closed` -> `open`: User activates the donation control.
- `open` -> `closed`: User dismisses the pane or completes/leaves the donation flow.

## Nephorion Site Link

**Purpose**: Represents the subtle external project link.

**Fields**:

- `label`: User-facing label that identifies Nephorion as an external destination.
- `url`: Fixed value `https://nephorion.com`.
- `targetBehavior`: Fixed value `new-tab-or-window`.
- `visualPriority`: Fixed value `secondary` relative to map controls and attribution.

**Validation Rules**:

- Activating the link must preserve the active Better Map page in the original tab/window.
- Link text or accessible label must make the destination understandable before activation.

## Deployment Version Indicator

**Purpose**: Represents the visible short build/version value and backend comparison metadata.

**Fields**:

- `frontendShortHash`: Short hash displayed by the frontend; must be the deployed commit hash on Railway.
- `backendShortHash`: Short hash returned by `/api/version`, or null when unavailable.
- `source`: One of `explicit-version`, `railway-metadata`, `git`, or `dev-fallback`.
- `mismatch`: Boolean indicating whether frontend and backend hashes are both present and different.
- `error`: Non-blocking status message when a mismatch is detected.

**Validation Rules**:

- Railway deployments must not display `dev` when Railway commit metadata is available.
- Local/non-production environments may display `dev` when no commit metadata exists.
- Mismatch errors must remain non-blocking.

**State Transitions**:

- `unknown` -> `resolved`: Hash metadata resolves successfully from explicit, Railway, or Git source.
- `unknown` -> `dev-fallback`: No commit metadata is available in a local/non-production run.
- `resolved` -> `mismatch-visible`: Frontend and backend hashes differ.
