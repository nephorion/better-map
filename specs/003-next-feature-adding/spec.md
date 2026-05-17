# Feature Specification: Analytics, Donations, Nephorion Link, and Version Hash Fix

**Feature Branch**: `003-next-feature-adding`

**Created**: 2026-05-17

**Status**: Draft

**Input**: User description: "The next feature will be adding Google analyitics to the repo my GA tag for this is G-PZ4DB72GNK. Also add a KoFI button subtally on the main page sothat people can donate. Also add a very subtle link to the nmephorion main site."

## Clarifications

### Session 2026-05-17

- Q: Should Google Analytics load immediately and what should it track? -> A: Load on page load; track only default page views, no custom user/callsign events.
- Q: How should external links navigate? -> A: The Nephorion external link opens in a new browser tab/window; Ko-fi donation uses the in-page pane defined below.
- Q: What are the exact support destinations and should Ko-fi navigate away? -> A: Nephorion uses https://nephorion.com; Ko-fi should use an in-page donation pane rather than navigate away.
- Q: What Ko-fi page should the in-page donation pane use? -> A: https://ko-fi.com/museofnephorion.
- Q: How should the Ko-fi donation entry point be presented? -> A: Use a custom subtle Better Map button that opens the in-page Ko-fi pane.
- Q: Should this change also fix the deployed short version hash? -> A: Railway deployments must show the actual short commit hash instead of `dev`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Understand Site Usage (Priority: P1)

As the project owner, I want page usage to be measured with the provided Google Analytics property so I can understand how people use Better Map after it is deployed.

**Why this priority**: Analytics is the foundation for understanding whether the map is being discovered and used, and it does not depend on the donation or external-link UI.

**Independent Test**: Can be tested by opening the public app and confirming that the configured Google Analytics property receives a page-view event without requiring any visible user interaction.

**Acceptance Scenarios**:

1. **Given** a visitor opens Better Map in a normal browser session, **When** the main page loads, **Then** the site records a default page view for Google Analytics measurement ID `G-PZ4DB72GNK`.
2. **Given** analytics is unavailable because the visitor blocks tracking or the analytics service fails, **When** the main page loads, **Then** the map remains usable without visible errors or degraded core functionality.

---

### User Story 2 - Offer a Subtle Donation Path (Priority: P2)

As a visitor who finds Better Map useful, I want a discreet way to donate so I can support the project without the donation prompt distracting from map exploration.

**Why this priority**: Donations support the project, but the control must not compete with the primary map experience.

**Independent Test**: Can be tested by loading the main page, identifying the donation affordance, and opening an in-page Ko-fi donation pane while the map remains the visual focus.

**Acceptance Scenarios**:

1. **Given** a visitor is viewing the main map page, **When** they scan the persistent page controls, **Then** a custom subtle Better Map donation button is available but visually secondary to map controls and attribution.
2. **Given** a visitor activates the donation affordance, **When** the donation flow opens, **Then** a Ko-fi donation pane appears within Better Map without replacing the active map page.

---

### User Story 3 - Discover the Nephorion Main Site (Priority: P3)

As a visitor, I want a low-key link to the Nephorion main site so I can learn more about the organization behind Better Map without the link feeling like advertising.

**Why this priority**: The link improves project context and discoverability, but it is less critical than analytics and support options.

**Independent Test**: Can be tested by loading the main page, finding the Nephorion link, and confirming it navigates to the main site while remaining visually subtle.

**Acceptance Scenarios**:

1. **Given** a visitor is viewing the main map page, **When** they look near supporting page information, **Then** a subtle Nephorion main-site link is present and understandable.
2. **Given** a visitor activates the Nephorion link, **When** navigation occurs, **Then** `https://nephorion.com` opens in a new browser tab or window without replacing the active Better Map page.

---

### User Story 4 - Verify Deployed Version (Priority: P2)

As the project owner, I want the deployed Railway site to show the actual short commit hash instead of `dev` so I can confirm which version is running in production.

**Why this priority**: The version indicator supports deployment verification and troubleshooting, especially when validating analytics and donation changes after release.

**Independent Test**: Can be tested by opening the Railway-deployed site and confirming the visible short version value corresponds to the deployed commit rather than the fallback `dev` label.

**Acceptance Scenarios**:

1. **Given** Better Map is deployed on Railway from a known commit, **When** the deployed site loads, **Then** the visible short version indicator shows the deployed commit's short hash instead of `dev`.
2. **Given** the app is running in a local development environment without deployment commit metadata, **When** the site loads, **Then** the version indicator may show `dev` without blocking map functionality.

---

### Edge Cases

- If analytics scripts are blocked, the app must continue to load and the map must remain usable.
- If a donation or Nephorion destination cannot be reached, the current Better Map page must not display a blocking error.
- On small mobile viewports, the donation affordance and Nephorion link must remain accessible without covering primary map controls, required attribution, or critical status messages.
- On first load and returning visits, the subtle additions must not interrupt callsign entry, map browsing, refresh controls, or selected-contact details.
- External navigation must be labeled clearly enough that users understand they are leaving Better Map.
- The Ko-fi donation pane must be dismissible without reloading the map or changing map state.
- External Nephorion navigation must preserve the active Better Map page in the original tab or window.
- If deployment commit metadata is unavailable in a non-production environment, the version indicator may fall back to `dev` without affecting core functionality.
- If the frontend and backend expose different short hashes in a deployed environment, the existing mismatch warning behavior must remain visible and non-blocking.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST record site usage with Google Analytics measurement ID `G-PZ4DB72GNK` when the main application is loaded.
- **FR-001a**: The system MUST limit analytics for this feature to default page-view measurement and MUST NOT add custom analytics events for callsigns, map interactions, donations, or external-link clicks.
- **FR-002**: The system MUST preserve all core map functionality if analytics cannot load, is blocked, or fails.
- **FR-003**: The main page MUST provide a custom subtle Better Map donation button that is visible but visually secondary to the map experience.
- **FR-004**: Users MUST be able to activate the custom Ko-fi donation button and open an in-page donation pane for `https://ko-fi.com/museofnephorion` from the main page.
- **FR-004a**: The Ko-fi donation pane MUST be dismissible without reloading Better Map or changing the current map state.
- **FR-005**: The main page MUST provide a subtle link to the Nephorion main site.
- **FR-006**: Users MUST be able to activate the Nephorion link and reach `https://nephorion.com`.
- **FR-006a**: Activating the Nephorion link MUST open the main-site destination in a new browser tab or window.
- **FR-007**: Donation and Nephorion links MUST remain accessible on desktop and mobile-sized viewports without obscuring required map attribution or primary map controls.
- **FR-008**: The donation and Nephorion link presentation MUST not use modal popups, interstitial prompts, or attention-grabbing animations.
- **FR-009**: External navigation labels MUST make the destination understandable before activation.
- **FR-010**: Railway deployments MUST show the actual deployed short commit hash in the visible version indicator instead of the fallback `dev` label.
- **FR-011**: Local or non-production runs without available commit metadata MAY show `dev` in the version indicator.
- **FR-012**: The existing frontend/backend version mismatch warning behavior MUST continue to work when deployed hashes are available.

### Key Entities

- **Analytics Measurement**: The page-load usage signal associated with Google Analytics measurement ID `G-PZ4DB72GNK`.
- **Donation Affordance**: The custom subtle Better Map button shown on the main page, including its label and `https://ko-fi.com/museofnephorion` donation page.
- **Nephorion Site Link**: The subtle external link from Better Map to the Nephorion main site.
- **Deployment Version Indicator**: The visible short version value used to identify the deployed Better Map build.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A page-view event for measurement ID `G-PZ4DB72GNK` is observable during verification when the main page loads in an environment that allows analytics.
- **SC-002**: The main map remains usable when analytics is blocked or unavailable, with no user-visible analytics error.
- **SC-003**: In desktop and mobile verification, the Ko-fi donation affordance and Nephorion link are both reachable without covering required map attribution or primary controls.
- **SC-004**: A user can identify and activate the donation affordance and Nephorion link within 10 seconds when intentionally looking for supporting project links.
- **SC-004a**: Opening and dismissing the Ko-fi donation pane leaves the active Better Map page available with its current map state unchanged.
- **SC-004b**: Activating the Nephorion link leaves the active Better Map page available in its original tab or window.
- **SC-005**: The new support links do not add any modal, interstitial, or animated prompt to the main map page.
- **SC-006**: On the Railway-deployed site, the visible short version indicator shows a commit hash value rather than `dev`.
- **SC-007**: Version indicator fallback or mismatch states remain non-blocking and do not prevent map use.

## Assumptions

- The Google Analytics measurement ID provided by the user, `G-PZ4DB72GNK`, is the correct property for Better Map.
- Google Analytics loads on page load without adding a new consent prompt as part of this feature.
- The Ko-fi account/page for the in-page donation pane is `https://ko-fi.com/museofnephorion`.
- The Nephorion main-site destination is `https://nephorion.com`.
- Analytics consent requirements, if any apply to the deployment target, will be handled according to the deployment environment's policy before release.
- The additions should fit into the existing full-window map UI and remain less prominent than map controls, status, and attribution.
- The Ko-fi entry point uses a custom Better Map control rather than Ko-fi's default floating widget button or an always-visible embedded panel.
- Railway exposes or can be configured to expose deployed commit metadata during the build or runtime process.
