# Research: Analytics, Donations, Nephorion Link, and Version Hash Fix

## Google Analytics Loading

**Decision**: Add Google Analytics for measurement ID `G-PZ4DB72GNK` as a default page-view-only integration that loads with the app and does not emit custom events.

**Rationale**: The clarified requirement asks for page usage measurement only. Keeping analytics limited to default page views reduces privacy risk, avoids accidentally tracking callsigns or map interactions, and is easier to verify.

**Alternatives considered**: A consent prompt was deferred because it was not requested for this feature; custom event tracking was rejected because the spec explicitly prohibits callsign, map, donation, and external-link events.

## Ko-fi Donation Pane

**Decision**: Use a custom subtle Better Map button to open a dismissible in-page Ko-fi donation pane for `https://ko-fi.com/museofnephorion`, following Ko-fi's documented website widget/embed approach during implementation.

**Rationale**: A custom button preserves the map UI's visual language while the in-page pane avoids navigating away from Better Map. The user explicitly rejected a navigate-away donation flow and chose a custom control over Ko-fi's default floating widget button or always-visible panel.

**Alternatives considered**: Same-tab or new-tab navigation was rejected because it interrupts the map experience. Ko-fi's default floating widget was rejected because it is less subtle and less integrated with Better Map's existing controls. An always-visible embedded panel was rejected because it would compete with the map.

## Nephorion Link Navigation

**Decision**: Add a subtle link to `https://nephorion.com` that opens in a new browser tab or window.

**Rationale**: New-tab navigation preserves the active Better Map state and matches the clarified external-link behavior. The link remains discoverable without competing with map controls or attribution.

**Alternatives considered**: Same-tab navigation was rejected because it would replace the active map page and could lose transient map state.

## Railway Version Hash Resolution

**Decision**: Resolve deployed short hashes from explicit version metadata first, using `BETTER_MAP_VERSION` where configured and Railway Git commit metadata such as `RAILWAY_GIT_COMMIT_SHA` when available, then fall back to `git rev-parse`, and finally to `dev` only for local/non-production builds without commit metadata.

**Rationale**: Railway deployments may not have a usable `.git` directory during frontend build or backend runtime, which can cause the current Git command fallback to show `dev`. Railway-provided commit metadata is the correct deployment source of truth and can be shared by frontend build-time configuration and backend runtime version endpoint behavior.

**Alternatives considered**: Relying only on `git rev-parse` was rejected because it already fails on the deployed Railway site. Hardcoding hashes was rejected because it is brittle and manual. Removing the version indicator was rejected because deployed version verification is an explicit requirement.

## Version Mismatch Behavior

**Decision**: Preserve the existing frontend/backend mismatch warning and keep all version metadata failures non-blocking.

**Rationale**: The existing UI already surfaces non-destructive mismatch errors. Keeping this behavior protects map usability while still helping diagnose deployment drift.

**Alternatives considered**: Blocking the app on version mismatch was rejected because version metadata is diagnostic and should not prevent map use.

## Automated Verification Scope

**Decision**: Verify analytics injection/page-view configuration, support-link rendering and interactions, Ko-fi pane dismissal/state preservation, Nephorion new-tab navigation, Railway hash resolution precedence, and backend version endpoint behavior with automated tests.

**Rationale**: The constitution requires automated quality gates and 100% coverage. The feature spans frontend UI, build-time metadata, and a backend endpoint, so both frontend and backend tests are required.

**Alternatives considered**: Manual-only deployed verification was rejected as insufficient, though a Railway smoke check remains useful after merge/deploy.
