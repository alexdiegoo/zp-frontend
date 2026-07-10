# Feature Specification: Mobile-First Styling Refactor

**Feature Branch**: `014-mobile-first-styling`  
**Created**: 2026-07-10  
**Status**: Draft  
**Input**: User description: "Refactor the app's styling to be mobile-first."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate and operate the app shell on a phone (Priority: P1)

A clinic team member opens ZapBlast on their phone during a busy day at the front desk. The
application shell — navigation, top bar, and the current page's content — fits the phone
screen without any horizontal scrolling. The primary navigation is reachable through a
compact, touch-friendly control (rather than a permanently visible sidebar that would cover
the screen), and the main content uses the full available width.

**Why this priority**: The authenticated app shell wraps every page in the product. If the
shell itself does not adapt to small screens, no other page is usable on mobile regardless of
its own styling. Fixing the shell is the single change that unlocks mobile usage of the entire
product, so it is the minimum viable slice.

**Independent Test**: Load any authenticated page on a 375px-wide viewport and confirm the
content is fully visible with no horizontal scroll, the navigation is accessible via a
touch-friendly control, and opening/closing navigation does not obscure or break the content.

**Acceptance Scenarios**:

1. **Given** an authenticated user on a phone-sized viewport, **When** they open any app page,
   **Then** the page content occupies the full screen width with no horizontal scrolling and no
   content hidden behind a persistent sidebar.
2. **Given** an authenticated user on a phone-sized viewport, **When** they tap the navigation
   control, **Then** the navigation menu appears as an overlay/drawer and can be dismissed to
   return to the content.
3. **Given** an authenticated user on a desktop-sized viewport, **When** they view any app page,
   **Then** the existing sidebar-plus-content layout is preserved (no regression for larger
   screens).

---

### User Story 2 - Complete core CRM tasks on mobile (Priority: P2)

A user needs to review a lead's details, work the pipeline, read and reply to a WhatsApp
conversation, and check today's schedule — all from their phone. Data-dense views (patient
and campaign lists, the pipeline/funnel board, the chat conversation + thread, dashboards,
and the schedule) reflow so the information is readable and the actions are tappable on a
small screen, instead of relying on side-by-side desktop layouts.

**Why this priority**: Once the shell is mobile-ready (P1), the highest-value daily workflows
must actually be usable on mobile. This delivers the real business value of mobile access to
the CRM and campaign features, but depends on P1 being in place first.

**Independent Test**: On a phone-sized viewport, open the patients list, the funnel board, the
chat page, the dashboard, and the schedule; confirm each presents its information legibly,
without horizontal scroll of the whole page, and with interactive elements large enough to tap.

**Acceptance Scenarios**:

1. **Given** a data table (e.g. patients, campaigns) on a phone-sized viewport, **When** the
   user views it, **Then** the table's information is presented in a mobile-appropriate form
   (e.g. stacked/card layout or a horizontally scrollable region contained to the table) so no
   information is truncated or lost and the page as a whole does not scroll horizontally.
2. **Given** the chat page (conversation list + message thread) on a phone-sized viewport,
   **When** the user selects a conversation, **Then** the thread is shown full-screen with a
   clear way to return to the conversation list, rather than two panes competing for width.
3. **Given** the pipeline/funnel board on a phone-sized viewport, **When** the user views it,
   **Then** stages are navigable (e.g. horizontal swipe within the board) with legible cards
   and touch-friendly controls.
4. **Given** any form (login, register, create campaign, create template, settings) on a
   phone-sized viewport, **When** the user fills it out, **Then** fields, labels, and buttons
   stack vertically, remain fully visible, and are comfortably tappable.

---

### User Story 3 - Consistent, adaptive experience across all breakpoints (Priority: P3)

As a user resizes their browser or switches between phone, tablet, and desktop, every page
adapts smoothly at each size without broken layouts, overlapping elements, clipped text, or
orphaned horizontal scrollbars. The experience feels intentionally designed for each screen
size, following a single consistent responsive approach across the whole product.

**Why this priority**: This hardens the refactor into a durable, uniform standard so future
pages inherit mobile-first behavior by default. It builds on P1 and P2 and turns one-off fixes
into a consistent system, but the product is already valuable on mobile before this is complete.

**Independent Test**: Sweep a representative set of pages across phone, tablet, and desktop
widths (and the tablet-to-desktop transition around the layout breakpoint) and confirm each
page reflows cleanly with no broken or overlapping elements at any tested width.

**Acceptance Scenarios**:

1. **Given** any page in the product, **When** it is viewed at phone, tablet, and desktop
   widths, **Then** the layout is coherent and usable at each width with no horizontal page
   scroll and no overlapping or clipped elements.
2. **Given** the full set of pages, **When** they are reviewed against the responsive approach,
   **Then** styling starts from the small-screen layout and progressively enhances for larger
   screens (rather than assuming a large screen and patching for small ones).

---

### Edge Cases

- **Very narrow viewports (~320px)**: The smallest commonly supported phone width must still
  render every page without horizontal page scroll or clipped controls.
- **Landscape phone / short viewports**: Fixed-height regions (e.g. the chat thread, the funnel
  board) must remain usable when vertical space is limited.
- **Long content in constrained space**: Long lead names, campaign titles, template bodies, and
  message text must wrap or truncate gracefully instead of forcing the layout wider.
- **Navigation drawer open state**: Opening the mobile navigation must not allow the page behind
  it to scroll unexpectedly or trap focus incorrectly; dismissing must restore the prior state.
- **Wide/unavoidably tabular data**: Where content is genuinely wide (large tables, the kanban
  board), horizontal scrolling must be confined to that component, never the whole page.
- **Orientation / resize while a view is open**: Rotating the device or resizing the window must
  not leave the layout in a broken intermediate state.

## Clarifications

### Session 2026-07-10

- Q: At what viewport width should the layout switch from the mobile drawer navigation to the persistent desktop sidebar? → A: Persistent sidebar at ≥1024px (`lg`); phones and tablets (below 1024px) use the drawer.
- Q: What is the minimum touch target size for primary interactive controls on touch devices? → A: 44×44px (WCAG 2.2 / Apple HIG).
- Q: What is the default small-screen presentation for data tables? → A: Card/stacked rows by default; contained horizontal scroll only as a fallback for very wide tables.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST apply a mobile-first responsive approach in which the default
  (unprefixed) styling targets small screens and larger-screen layouts are layered on as
  progressive enhancements.
- **FR-002**: Below 1024px (phones and tablets), primary navigation MUST NOT permanently occupy
  screen space; it MUST be presented through a compact, touch-friendly control that opens an
  overlay/drawer and can be dismissed.
- **FR-003**: At 1024px and above, the current persistent sidebar-plus-content layout MUST be
  preserved with no visual or behavioral regression.
- **FR-004**: Main page content MUST occupy the full available width on small screens (no
  content hidden behind or offset by a persistent sidebar).
- **FR-005**: No page MUST require horizontal scrolling of the entire page at any supported
  viewport width; where content is intrinsically wide, horizontal scrolling MUST be confined to
  the specific component (e.g. a table region or the funnel board).
- **FR-006**: Data tables MUST default to a card/stacked-row presentation on small screens such
  that no information is lost and the page does not scroll horizontally as a whole. A contained
  horizontal-scroll region MAY be used as a fallback only for genuinely wide tables where a card
  layout is impractical.
- **FR-007**: The chat page MUST adapt its multi-pane (conversation list + thread) layout to a
  single-pane, navigable experience on small screens, with a clear way to move between the list
  and a selected conversation.
- **FR-008**: The pipeline/funnel board MUST remain navigable and legible on small screens, with
  touch-friendly controls and horizontal navigation confined to the board.
- **FR-009**: All forms MUST stack their fields, labels, and actions vertically on small screens,
  keeping every field and control fully visible and usable.
- **FR-010**: Primary interactive elements (buttons, links, menu items, form controls) MUST
  provide a touch target of at least 44×44px and adequate spacing to be operated reliably by
  touch on small screens.
- **FR-011**: Text and media MUST wrap, truncate, or scale gracefully so that long values do not
  force the layout wider than the viewport.
- **FR-012**: The responsive approach MUST be applied consistently across all pages and shared
  components, so the whole product follows one standard rather than page-by-page exceptions.
- **FR-013**: The refactor MUST preserve existing functionality, content, and the established
  visual theme (colors, typography, spacing tokens); it changes layout/adaptation only, not the
  product's features or brand styling.
- **FR-014**: The refactor MUST cover the authenticated application, the authentication pages
  (login/register), and the public landing page.

### Key Entities

*(Not applicable — this feature changes presentation/layout only and introduces no new data
entities.)*

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the product's pages render without horizontal page scrolling at 320px,
  375px, and 768px viewport widths.
- **SC-002**: On small screens, a user can reach any top-level navigation destination in no more
  than two taps (open navigation, then select destination).
- **SC-003**: 100% of the core daily workflows (view a patient, work the funnel, read/reply in
  chat, view the dashboard, view the schedule) are completable on a phone-sized viewport without
  encountering hidden, clipped, or untappable controls.
- **SC-004**: Every page reflows without broken, overlapping, or clipped layout at phone (≤375px),
  tablet (~768px), and desktop (≥1024px) widths.
- **SC-005**: Desktop layouts show no regression — the large-screen presentation of every page
  matches the pre-refactor experience.
- **SC-006**: On touch devices, primary interactive controls present a touch target of at least
  44×44px so users can operate them reliably on the first attempt.

## Assumptions

- **Responsive web, not native**: "Mobile-first" means a responsive web experience that adapts
  by viewport width; no separate native mobile app is in scope.
- **Supported range**: The smallest supported viewport is ~320px wide; the layout breakpoint
  between the mobile (drawer navigation) and desktop (persistent sidebar) shell is 1024px (`lg`).
  Tablets (~768px) therefore use the drawer + full-width content, not the persistent sidebar.
- **Scope is styling/layout only**: No changes to business logic, data fetching, routing, or
  backend contracts. Functionality is preserved; only how it is laid out and adapted changes.
- **Theme is preserved**: The existing color tokens, typography, and spacing system remain the
  source of truth; this work does not restyle the brand, only how components reflow.
- **Whole product in scope**: The authenticated app pages, the shared layout shell (sidebar/top
  bar), the auth pages, and the public landing page are all included; component primitives under
  `components/ui/` inherit responsive behavior through how they are composed rather than being
  individually redesigned.
- **Data tables on mobile**: Tables default to a stacked/card presentation on small screens; a
  contained scrollable region is used only as a fallback for genuinely wide tables, satisfying
  FR-005 and FR-006.
