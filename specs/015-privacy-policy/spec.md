# Feature Specification: Privacy Policy Page for Facebook App

**Feature Branch**: `015-privacy-policy`
**Created**: 2026-07-13
**Status**: Draft
**Input**: User description: "Create a privacy policy page for a Facebook app"

## Context

ZapBlast integrates with the Meta (Facebook) platform to dispatch WhatsApp campaigns
through the official WhatsApp Cloud API. Meta's app review requires every app that
handles user data to publish a **publicly accessible privacy policy at a stable URL**
and to describe how users can request deletion of their data. This feature delivers that
page so the app can pass Meta review and so leads, patients, and clinic staff can
understand how their data is handled.

The audience is Brazilian clinics and their contacts, so the policy content is written in
**Portuguese (pt-BR)** and reflects Brazilian data-protection expectations (LGPD).
Data deletion is handled via **written instructions** on the page (a contact-based
request), not a programmatic callback endpoint.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Public visitor reads the privacy policy (Priority: P1)

Anyone with the link — including a Meta app reviewer — can open the privacy policy at a
stable, public URL and read the complete policy without logging in or creating an account.

**Why this priority**: Without a reachable public URL that renders the full policy, the
Facebook app cannot pass review and the legal obligation is unmet. This is the minimum
viable slice — everything else builds on the page existing and being readable.

**Independent Test**: Open the privacy policy URL in a fresh browser session with no
authentication and confirm the full policy content renders. Delivers the core value: a
citable, public privacy policy.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** they navigate to the privacy policy URL, **Then** the full policy content is displayed without any login prompt or redirect.
2. **Given** the page is loaded, **When** the visitor scrolls, **Then** all required sections (data collected, how it is used, sharing, retention, user rights, data deletion, contact, effective date) are present and readable.
3. **Given** a Meta app reviewer opens the URL, **When** they inspect the page, **Then** the URL is permanent (not behind a session, feature flag, or expiring link) and returns a successful response.

---

### User Story 2 - Reader learns how to request data deletion and exercise rights (Priority: P2)

A person whose data is held (a lead, patient, or clinic user) can find a clear,
step-by-step explanation of how to request deletion of their personal data and how to
exercise their other privacy rights.

**Why this priority**: Meta review and LGPD both require a described data-deletion path.
It is essential but depends on the page (P1) existing first.

**Independent Test**: Locate the "data deletion / your rights" section on the page and
confirm it states exactly what a person must do (the contact channel and the information
to provide) to have their data deleted.

**Acceptance Scenarios**:

1. **Given** the policy page, **When** the reader looks for data deletion, **Then** a dedicated section explains the request channel and the steps to submit a deletion request.
2. **Given** the data deletion section, **When** the reader reads it, **Then** it states the expected timeframe for the request to be handled.
3. **Given** the "your rights" content, **When** the reader reviews it, **Then** the rights available under LGPD (access, correction, deletion, portability, revoke consent) are enumerated.

---

### User Story 3 - Reader identifies who controls the data, when the policy applies, and how to make contact (Priority: P3)

A reader can see who the data controller is, the effective/last-updated date of the
policy, and a working contact channel for privacy questions.

**Why this priority**: Improves trust and completeness and is expected by reviewers, but
the page is already viable for review once P1 and P2 are met.

**Independent Test**: Confirm the page displays the controlling entity's identity, an
effective date, and a contact method for privacy inquiries.

**Acceptance Scenarios**:

1. **Given** the policy page, **When** the reader reaches the header or footer, **Then** the effective/last-updated date is clearly shown.
2. **Given** the policy page, **When** the reader looks for contact details, **Then** a privacy contact channel is provided.
3. **Given** the policy page, **When** the reader looks for the responsible party, **Then** the data controller (company/clinic operator) is identified.

---

### Edge Cases

- **Deep link / direct navigation**: The URL must resolve correctly when opened directly (pasted into a browser or crawled), not only via in-app navigation.
- **Unauthenticated access**: Any global authentication or route protection must explicitly exclude this page so visitors are never redirected to a login screen.
- **Mobile & small screens**: The policy must remain readable and navigable on mobile viewports (the product is mobile-first).
- **Long content navigation**: The policy is long; a reader on any device should be able to reach a specific section without excessive scrolling difficulty.
- **Crawlability**: The page should be indexable/fetchable by automated reviewers and crawlers (no dependency on client-only gating that would hide content from a fetch).
- **Stale date**: If the policy content changes, the effective/last-updated date must reflect the change.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose a privacy policy at a single, stable, public URL that requires no authentication.
- **FR-002**: The system MUST render the full privacy policy content in Portuguese (pt-BR).
- **FR-003**: The page MUST describe the categories of personal data collected (e.g., contact identifiers, WhatsApp/phone data, campaign interaction data) and the purpose of each.
- **FR-004**: The page MUST explain how collected data is used, including its use for WhatsApp campaign dispatch via the Meta platform.
- **FR-005**: The page MUST describe whether and how data is shared with third parties, explicitly naming the Meta/WhatsApp platform as a data recipient/processor.
- **FR-006**: The page MUST state the data retention approach (how long data is kept and the basis for retention).
- **FR-007**: The page MUST include a dedicated data-deletion section that gives written, step-by-step instructions for requesting deletion, the contact channel to use, and the expected handling timeframe.
- **FR-008**: The page MUST enumerate the data-subject rights available under LGPD (access, correction, deletion, portability, and consent revocation).
- **FR-009**: The page MUST identify the data controller (the responsible entity) and provide a privacy contact channel.
- **FR-010**: The page MUST display an effective/last-updated date.
- **FR-011**: The page MUST be readable and navigable on mobile and desktop viewports.
- **FR-012**: The page content MUST be reachable by automated fetch/crawl (a reviewer or crawler retrieving the URL receives the policy content).
- **FR-013**: Global authentication/route protection MUST NOT block, gate, or redirect access to this page.
- **FR-014**: The page MUST present the policy in clearly labeled sections so a reader can locate a specific topic.

### Key Entities *(include if feature involves data)*

- **Privacy Policy Document**: The published policy content, composed of ordered sections (data collected, usage, sharing, retention, rights, data deletion, contact) plus metadata: the controlling entity's identity, the privacy contact channel, and the effective/last-updated date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A person with no account can open the privacy policy URL and see the full policy on the first load, with zero authentication steps.
- **SC-002**: 100% of the required topics (data collected, usage, sharing, retention, rights, data deletion, contact, effective date) are present on the page.
- **SC-003**: A reader can locate the data-deletion instructions within 30 seconds of opening the page.
- **SC-004**: The privacy policy URL passes Meta app review's privacy-policy-URL requirement on submission.
- **SC-005**: The page renders without horizontal scrolling or unreadable text on a 375px-wide mobile viewport.
- **SC-006**: An automated fetch of the URL returns the policy content (the page is not hidden behind client-only gating).

## Assumptions

- The page is a **public, unauthenticated** content page and lives outside the authenticated dashboard area.
- Data deletion is satisfied by **written instructions** (a contact-based request), per the confirmed scope — no programmatic Meta Data Deletion Callback endpoint is built in this feature.
- Policy content is authored/approved by the business (legal-reviewed copy); this feature delivers the page that presents that content. Placeholder copy may be used until final legal text is supplied.
- The controlling entity, privacy contact channel, and effective date are provided by the business and are subject to change without requiring a structural redesign.
- The policy targets Brazilian data-protection expectations (LGPD); a separate GDPR/other-jurisdiction variant is out of scope for this version.
- The content is single-language (pt-BR); no language toggle is required.
- The page reuses the project's existing layout, typography, and theming conventions rather than introducing bespoke styling.
