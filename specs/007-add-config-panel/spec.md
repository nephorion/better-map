# Feature Specification: Configuration Panel

**Feature Branch**: `007-add-config-panel`

**Created**: 2026-05-18

**Status**: Draft

**Input**: User description: "Lets ann a config panel. There should be a new buttonb at the nbottom ;eft with a cog that will open a configuration  window. The selecty callsign popul shoul,d now be this one when a callsign has not been selected yet. This config shoiu;ld allow a user to specify they location in MGRS 6 digit or 4 digfir forma. It should also allow the user to select one of the standard bands, and modes. Use the web to find these. If the user selects mexded on any of these it means there is no filter. The selection should be able to select multiple bands and m,odes. The wsprnet results should be filtered by this. Obviosuly not mode as mode for wspr would be wspr but in futrire we will look at log books."

## Clarifications

### Session 2026-05-18

- Q: Is Maidenhead grid location required to save configuration? → A: Maidenhead grid location is optional; empty is allowed.
- Q: Should the configuration panel include callsign entry? → A: Configuration panel includes optional callsign field.
- Q: How long should configuration persist? → A: Persist configuration across browser sessions on this device.
- Q: Can Maidenhead grid location be sent outside the browser for this feature? → A: Backend or WSPRnet requests may include Maidenhead grid when useful.
- Q: What should the map show when no callsign is configured? → A: Fetch general WSPR results without a callsign.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open And Complete Configuration (Priority: P1)

A map user can open a configuration window from a cog button at the bottom-left of the screen and provide the information needed to personalize map results, including an optional callsign for callsign-dependent views.

**Why this priority**: The configuration panel becomes the primary entry point when no callsign has been selected, so users need a clear path to start using the map without being blocked by the older callsign-only prompt.

**Independent Test**: Can be fully tested by loading the map with no callsign selected, confirming the configuration window appears, entering valid optional callsign, location, and filter preferences, saving them, and observing that the map can continue without the old callsign-only prompt while showing general WSPR results when no callsign is configured.

**Acceptance Scenarios**:

1. **Given** no callsign has been selected, **When** the user opens or refreshes the map, **Then** the configuration window is shown instead of the previous callsign selection prompt.
2. **Given** the map is visible, **When** the user selects the bottom-left cog button, **Then** the configuration window opens without obscuring access to the rest of the map permanently.
3. **Given** the configuration window is open, **When** the user enters a valid callsign and saves, **Then** the callsign is accepted as part of the user's configuration.
4. **Given** the configuration window is open, **When** the user leaves callsign empty and saves otherwise valid settings, **Then** the configuration is accepted without a callsign.
5. **Given** valid configuration has been saved, **When** the user refreshes or returns in a later browser session on the same device, **Then** the saved configuration is restored.
6. **Given** no callsign is configured, **When** WSPRnet results are shown, **Then** general WSPR results are fetched and displayed instead of requiring a callsign first.

---

### User Story 2 - Set Operating Location (Priority: P1)

A user can optionally specify their operating location using a Military Grid Reference System value at either 4-digit or 6-digit precision so map features can be centered or interpreted relative to the user's approximate position when a location is provided.

**Why this priority**: The user's location is core configuration data and must be captured in a radio-operator-friendly format before other personalized views can be reliable.

**Independent Test**: Can be fully tested by saving an empty location, entering valid 4-character and 6-character Maidenhead grid locations, saving each value, and confirming invalid or incomplete Maidenhead values are rejected with clear guidance.

**Acceptance Scenarios**:

1. **Given** the configuration window is open, **When** the user enters a valid 4-character Maidenhead grid location and saves, **Then** the location is accepted.
2. **Given** the configuration window is open, **When** the user enters a valid 6-character Maidenhead grid location and saves, **Then** the location is accepted.
3. **Given** the configuration window is open, **When** the user leaves Maidenhead grid location empty and saves, **Then** the configuration is accepted without an operating location.
4. **Given** the configuration window is open, **When** the user enters an invalid Maidenhead grid location, **Then** the user is told the expected format and the invalid location is not saved.

---

### User Story 3 - Filter WSPR Results By Band (Priority: P2)

A user can select one or more standard amateur radio bands in configuration and have WSPRnet results limited to the selected bands, or choose Mixed to see all bands.

**Why this priority**: Band filtering reduces noise in WSPRnet results and lets users focus on the portions of the radio spectrum they care about.

**Independent Test**: Can be fully tested by selecting one band, multiple bands, and Mixed, then confirming WSPRnet results match the selected band scope.

**Acceptance Scenarios**:

1. **Given** the user selects a single band, **When** WSPRnet results are shown, **Then** only results from that band are included.
2. **Given** the user selects multiple bands, **When** WSPRnet results are shown, **Then** results from any selected band are included and other bands are excluded.
3. **Given** the user selects Mixed for bands, **When** WSPRnet results are shown, **Then** no band filter is applied.

---

### User Story 4 - Select Modes For Future Filtering (Priority: P3)

A user can select one or more standard amateur radio modes in configuration and have those preferences saved for future result types, while current WSPRnet results remain unaffected by mode selection because their mode is WSPR.

**Why this priority**: Mode selection is needed for upcoming logbook filtering, but it should not create misleading behavior in the current WSPR-only result set.

**Independent Test**: Can be fully tested by selecting one mode, multiple modes, and Mixed, saving the configuration, and confirming WSPRnet results are not hidden by non-WSPR mode choices.

**Acceptance Scenarios**:

1. **Given** the user selects one or more modes, **When** the configuration is saved, **Then** the selected modes are retained as preferences.
2. **Given** the user selects Mixed for modes, **When** the configuration is saved, **Then** the mode preference represents no mode filter.
3. **Given** WSPRnet results are displayed, **When** the user has selected modes other than WSPR, **Then** WSPRnet results are still filtered only by applicable non-mode settings.

### Edge Cases

- If the user closes the configuration window without saving and has no existing configuration, the system preserves the previous state and keeps a clear way to reopen configuration.
- If both Mixed and specific bands are selected, Mixed takes precedence and represents no band filter.
- If both Mixed and specific modes are selected, Mixed takes precedence and represents no mode filter.
- If a saved band filter leaves no matching WSPRnet results, the user sees an empty-result state that explains the active filter.
- If WSPRnet data contains a band value that is unknown or cannot be mapped to a standard band, it is shown only when the band selection is Mixed.
- If the viewport is small, the cog button and configuration window remain usable without hiding required save or close actions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a cog-style configuration control at the bottom-left of the map interface.
- **FR-002**: The system MUST open a configuration window when the user activates the cog-style configuration control.
- **FR-003**: The system MUST show the configuration window instead of the previous callsign selection prompt whenever the user has not yet selected a callsign.
- **FR-003a**: The configuration window MUST include an optional callsign field that accepts the same valid callsign format as the existing callsign selection flow and allows an empty value.
- **FR-004**: The configuration window MUST allow the user to save with an empty operating location or enter an operating location in Maidenhead grid locator format with either 4-character or 6-character precision.
- **FR-005**: The system MUST reject non-empty invalid Maidenhead grid location values and explain the expected 4-character or 6-character Maidenhead format before saving.
- **FR-006**: The configuration window MUST allow the user to select zero, one, or multiple standard amateur radio bands.
- **FR-007**: The band selector MUST include Mixed as an option that means no band filter is applied.
- **FR-008**: The band selector MUST include common standard amateur bands spanning LF, MF, HF, VHF, UHF, and microwave amateur allocations, including 2200 m, 630 m, 160 m, 80 m, 60 m, 40 m, 30 m, 20 m, 17 m, 15 m, 12 m, 10 m, 6 m, 2 m, 1.25 m, 70 cm, 33 cm, 23 cm, 13 cm, 9 cm, 5 cm, 3 cm, and above 10.5 GHz.
- **FR-009**: The configuration window MUST allow the user to select zero, one, or multiple standard amateur radio modes.
- **FR-010**: The mode selector MUST include Mixed as an option that means no mode filter is applied.
- **FR-011**: The mode selector MUST include common standard amateur radio mode categories, including CW, AM, FM, SSB, digital/data, RTTY, packet, FT8, PSK31, WSPR, SSTV/image, ATV/video, satellite, and EME/weak-signal.
- **FR-012**: When Mixed is selected for bands or modes, the system MUST treat that setting as unfiltered even if specific options were previously selected.
- **FR-013**: The system MUST save the user's optional callsign, location, selected bands, and selected modes so the preferences can be reused across browser sessions on the same device.
- **FR-014**: The system MUST filter WSPRnet results by selected bands when the band selection is not Mixed.
- **FR-015**: The system MUST NOT filter current WSPRnet results by selected modes, because WSPRnet results are treated as WSPR mode for this feature.
- **FR-016**: The system MUST make active band filtering visible to the user through the selected configuration values or result-state messaging.
- **FR-017**: The user MUST be able to reopen the configuration window and change saved settings at any time from the map interface.
- **FR-018**: The system MAY include the saved Maidenhead grid location in backend or WSPRnet-related requests when doing so supports this feature's map or filtering behavior.
- **FR-019**: The system MUST fetch and display general WSPRnet results when no callsign is configured.

### Key Entities *(include if feature involves data)*

- **User Configuration**: The user's saved map preferences persisted on the same device, including optional callsign, operating location, selected bands, selected modes, and whether Mixed is selected for band or mode filtering.
- **Operating Location**: An optional user-provided Maidenhead grid locator accepted at 4-character or 6-character precision for approximate position-aware map behavior.
- **Band Preference**: A set of selected standard amateur radio bands, or Mixed to indicate all bands.
- **Mode Preference**: A set of selected standard amateur radio modes, or Mixed to indicate all modes.
- **WSPRnet Result**: A received result item with radio metadata, including a band that can be compared with the user's selected band preferences.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of users can open the configuration window from the map and save valid settings in under 60 seconds during usability testing.
- **SC-002**: 100% of invalid non-empty Maidenhead entries tested with malformed, incomplete, or wrong-precision values are rejected before saving with a user-readable explanation, while empty Maidenhead grid location is accepted.
- **SC-003**: WSPRnet result lists contain only selected bands in 100% of tests where one or more specific bands are selected.
- **SC-004**: WSPRnet result lists remain unfiltered by band in 100% of tests where Mixed is selected for bands.
- **SC-005**: WSPRnet result lists remain unaffected by non-WSPR mode selections in 100% of current WSPRnet filtering tests.
- **SC-006**: The bottom-left configuration control and save/close actions are usable without horizontal scrolling on common desktop and mobile viewport sizes.
- **SC-007**: 100% of saved configuration values are restored after a page refresh and in a later browser session on the same device when browser storage is available.
- **SC-008**: If saved Maidenhead grid location is included in backend or WSPRnet-related requests, 100% of such requests use the normalized saved Maidenhead value and omit it when no location is saved.
- **SC-009**: 100% of no-callsign result-loading tests display general WSPRnet results without requiring the user to enter a callsign first.

## Assumptions

- Mixed is interpreted as the user's intended meaning for the prompt's misspelled "mexded" value.
- A missing callsign means the configuration window should replace the old callsign-only prompt and the map should use general WSPRnet results until a callsign is configured.
- Band and mode lists should be broad enough for amateur radio use, using commonly referenced amateur allocations and mode categories rather than being limited to WSPR-only choices.
- Mode selections are captured now for future logbook filtering, while current WSPRnet filtering applies only to bands.
- Maidenhead grid locator precision for this feature means either field and square only, such as QF56, or field, square, and subsquare, such as QF56OD.
