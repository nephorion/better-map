# Feature Specification: Add AGPL v3 License

**Feature Branch**: `005-add-agpl-license`

**Created**: 2026-05-18

**Status**: Draft

**Input**: User description: " also add a license ... I want the AGPL v3 licesne"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Confirm Project License (Priority: P1)

As a visitor, user, or potential contributor, I want the project license to be clearly stated so I can understand the rights and obligations for using, sharing, modifying, or hosting the project.

**Why this priority**: A clear license is essential for adoption and contribution; without it, users and contributors cannot confidently reuse or collaborate on the project.

**Independent Test**: Review the repository's public-facing files and verify that the project is explicitly licensed under GNU Affero General Public License version 3.

**Acceptance Scenarios**:

1. **Given** a person views the repository, **When** they look for licensing information, **Then** they can identify GNU Affero General Public License version 3 as the project's license.
2. **Given** a person wants to understand the license terms, **When** they open the license information, **Then** they can read or access the full AGPL v3 terms.

---

### User Story 2 - Understand Network-Use Obligations (Priority: P2)

As a person deploying or hosting the project, I want the licensing information to make the AGPL v3 network-use obligations discoverable so I understand that modified hosted versions must provide corresponding source access.

**Why this priority**: The Affero license has obligations that are especially relevant to hosted software, and those obligations should be visible before someone deploys or modifies the project.

**Independent Test**: Review the licensing information from the perspective of a host or deployer and verify that it points to AGPL v3 terms covering network interaction.

**Acceptance Scenarios**:

1. **Given** a person plans to host a modified version, **When** they review the project license, **Then** they can determine that AGPL v3 obligations apply to network-accessible use.
2. **Given** a person distributes or offers access to a modified version, **When** they review the license information, **Then** they can find the obligation to provide corresponding source under the license terms.

---

### User Story 3 - Preserve Existing Product Behavior (Priority: P3)

As a map user, I want the addition of licensing information to avoid changing the map experience so existing functionality remains unaffected.

**Why this priority**: Licensing clarity is important, but it should not disrupt the existing user experience or map workflows.

**Independent Test**: Use the main map after the license update and verify that core map workflows remain unchanged.

**Acceptance Scenarios**:

1. **Given** the project license has been added, **When** a user opens the map, **Then** the map loads with the same visible functionality as before.
2. **Given** the project license has been added, **When** a user searches by callsign or interacts with the map, **Then** those workflows continue to operate as expected.

---

### Edge Cases

- If multiple locations mention licensing, they must consistently identify GNU Affero General Public License version 3.
- If package, project, or metadata fields expose a license value, they must not conflict with the AGPL v3 license statement.
- If a previous or placeholder license reference exists, it must be replaced or clarified so users are not given conflicting license information.
- If users view the project without reading all documentation, the primary license information must still be easy to find.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST clearly identify GNU Affero General Public License version 3 as its license.
- **FR-002**: The project MUST include the full standard AGPL v3 license terms or a clearly accessible copy of those terms.
- **FR-003**: Public-facing project documentation MUST make the license discoverable to users, contributors, deployers, and redistributors.
- **FR-004**: Any project metadata that declares a license MUST use a value consistent with AGPL v3.
- **FR-005**: The license addition MUST NOT change existing map features, data lookup behavior, support links, analytics behavior, or deployment behavior.
- **FR-006**: The license information MUST avoid conflicting statements about proprietary, permissive, or alternative licensing unless explicitly marked as not applicable.
- **FR-007**: The license information MUST be suitable for people evaluating project reuse, modification, hosting, and redistribution.

### Key Entities

- **Project License**: The authoritative statement that the project is licensed under GNU Affero General Public License version 3.
- **License Terms**: The full legal text or accessible standard copy of AGPL v3 that defines user, contributor, host, and redistributor obligations.
- **License Metadata**: Any structured project information that declares the selected license for tooling, package indexes, or repository viewers.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time repository visitor can identify the project license as AGPL v3 within 30 seconds.
- **SC-002**: 100% of license references reviewed in the repository consistently identify AGPL v3 with no conflicting license claims.
- **SC-003**: A deployer reviewing the license information can find the AGPL v3 terms relevant to hosted or network-accessible modified versions within 2 minutes.
- **SC-004**: Existing primary map workflows remain successful in 100% of post-license acceptance checks.
- **SC-005**: Repository license detection tools or viewers identify the project license as AGPL v3 where such detection is supported.

## Assumptions

- The intended license is GNU Affero General Public License version 3 only, not a separate commercial license or dual-license arrangement.
- The license applies to the repository as a whole unless a future change explicitly scopes a different license for specific files or assets.
- Adding license information is a documentation and project-governance change; no user-facing product behavior is intended to change.
- The standard AGPL v3 license text is acceptable without custom legal modifications.
