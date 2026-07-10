# Feature Specification: Component Unit Tests

**Feature Branch**: `013-component-unit-tests`  
**Created**: 2026-07-10  
**Status**: Draft  
**Input**: User description: "Implement unit tests for the project components"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Validation rules are guarded by tests (Priority: P1)

The team relies on client-side validation to protect data quality and to encode
domain rules — for example, that a WhatsApp campaign on the official channel is held to
different requirements than one on the unofficial channel, or that a patient contact must
carry a valid phone number. A developer changing a form or a shared validation rule needs
immediate, automatic confirmation that the accepted-input and rejected-input boundaries
still behave as intended, before the change ever reaches a running screen.

**Why this priority**: Validation encodes the highest-value business rules in the product
(channel differences, required contact fields, template constraints, appointment/procedure
constraints). A silent regression here corrupts data or blocks legitimate users. This is the
smallest slice that delivers real safety, so it ships first.

**Independent Test**: Run the test suite against the validation rules alone and confirm
that, for each rule, representative valid inputs are accepted and representative invalid
inputs are rejected with the correct error — with no other test areas implemented.

**Acceptance Scenarios**:

1. **Given** a valid set of inputs for a validation rule, **When** the suite runs, **Then** the rule accepts the input and reports no errors.
2. **Given** an input that violates a required field or format, **When** the suite runs, **Then** the rule rejects the input and surfaces the expected error message.
3. **Given** a campaign on the official channel and the same campaign on the unofficial channel, **When** the suite runs, **Then** each is validated against its own channel-specific requirements.
4. **Given** a cross-field rule (such as password confirmation or a dependent field), **When** the fields conflict, **Then** the error is attached to the correct field.

---

### User Story 2 - Shared utility and formatting logic is verified (Priority: P2)

Formatting and helper logic (dates, phone numbers, currency, template placeholder
substitution, service-window timing) is reused across many screens. A developer editing one
of these helpers needs confidence that every screen depending on it still renders the same
correct output, without manually opening each screen.

**Why this priority**: These helpers are pure and widely shared, so a single defect
propagates everywhere and is cheap to prevent. High value, low effort, but ranked below
validation because a formatting bug is cosmetic more often than it is data-corrupting.

**Independent Test**: Run the suite against the utility functions alone and confirm each
produces the expected output for normal inputs and documented edge cases, with no other
test areas implemented.

**Acceptance Scenarios**:

1. **Given** a representative input for a formatting helper, **When** the suite runs, **Then** the output matches the expected formatted value.
2. **Given** a boundary input (empty value, null, out-of-range, locale edge), **When** the suite runs, **Then** the helper handles it gracefully as specified rather than throwing unexpectedly.
3. **Given** a template with placeholders and a set of values, **When** substitution runs, **Then** the resolved text contains the substituted values in the correct positions.

---

### User Story 3 - Interactive behaviors in custom hooks are covered (Priority: P3)

Custom hooks encapsulate time- and state-dependent behavior — debouncing user input and
computing whether the official-channel 24-hour service window is open. A developer changing
this logic needs automatic confirmation that the timing and state transitions still behave
correctly across their boundaries.

**Why this priority**: This logic is subtle and easy to break, but it affects fewer surfaces
than validation or shared utilities, and failures are usually visible rather than silent.
It rounds out coverage of the product's non-trivial client logic.

**Independent Test**: Run the suite against the hooks alone and confirm that timing- and
state-driven outputs change at the expected boundaries, with no other test areas implemented.

**Acceptance Scenarios**:

1. **Given** a debounced value that changes rapidly, **When** less than the delay has elapsed, **Then** the debounced output has not yet updated; **When** the delay elapses, **Then** it updates to the latest value.
2. **Given** a service window with a known reference time, **When** the current time is inside the window, **Then** the hook reports the window open; **When** it is outside, **Then** it reports the window closed.

---

### User Story 4 - Shared UI components render and respond correctly (Priority: P4)

Shared presentation components (data table, page header, badges, empty and loading states)
are the building blocks of every screen. A developer changing one needs confirmation that it
still renders its expected states — populated, loading, and empty — and responds to the
interactions it exposes.

**Why this priority**: Component regressions are usually caught quickly in normal use and are
the most effort per unit of assurance, so this is the last slice. It is still valuable for the
highest-reuse components.

**Independent Test**: Render each targeted shared component in isolation and confirm its
loading, empty, and populated states appear as specified and that exposed interactions fire
the expected callbacks.

**Acceptance Scenarios**:

1. **Given** a shared component in its loading state, **When** it renders, **Then** a loading indicator (skeleton) is shown instead of content.
2. **Given** a shared component with no data, **When** it renders, **Then** the empty state is shown with its message.
3. **Given** a shared component with data and an interactive control, **When** the user activates the control, **Then** the corresponding callback is invoked with the expected argument.

---

### Edge Cases

- What happens when a validation rule receives an empty string versus an omitted optional field — are these distinguished correctly?
- How does a formatting helper behave with null, undefined, or malformed input (e.g. an unparseable date or a phone number with unexpected characters)?
- How is the service-window boundary treated exactly at the open/close instant (inclusive vs. exclusive)?
- What happens when a template references a placeholder for which no value is supplied?
- How does a test assert time-dependent behavior deterministically, without depending on the machine's real clock?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST have an automated unit-test capability that a developer can run locally with a single command and that also runs in the continuous-integration process.
- **FR-002**: The test suite MUST cover every shared validation rule, asserting both accepted inputs and rejected inputs with their expected error messages.
- **FR-003**: The test suite MUST assert the channel-specific differences between official and unofficial WhatsApp campaigns wherever validation or logic branches on the channel.
- **FR-004**: The test suite MUST cover the shared utility and formatting helpers, including their documented edge cases (empty, null, and boundary inputs).
- **FR-005**: The test suite MUST cover the custom hooks whose behavior depends on time or accumulated state, exercising the transitions at their boundaries.
- **FR-006**: The test suite MUST cover the highest-reuse shared UI components in their loading, empty, and populated states, and MUST verify that exposed interactive controls invoke their callbacks.
- **FR-007**: Time-dependent tests MUST produce the same result on every run regardless of the machine clock, by controlling time explicitly rather than reading the real clock.
- **FR-008**: Tests MUST run in isolation from the real backend and network — external dependencies MUST be substituted so that no test performs a real network request.
- **FR-009**: The test runner MUST report a pass/fail result and a coverage summary that identifies which of the targeted areas are covered.
- **FR-010**: A failing test MUST fail the continuous-integration process so regressions cannot merge silently.
- **FR-011**: Test files MUST be colocated with, or clearly associated to, the code they cover, following a single consistent naming convention across the project.

### Key Entities *(include if feature involves data)*

- **Test suite**: The complete collection of unit tests, grouped by the area under test (validation, utilities, hooks, components).
- **Test case**: A single assertion of expected behavior — an input (or rendered state and interaction) paired with the expected output or error.
- **Coverage report**: A summary of which units of the codebase are exercised by the suite and to what degree.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can run the entire unit-test suite with a single command and receive a clear pass/fail result.
- **SC-002**: 100% of the shared validation rules have tests covering at least one accepted and one rejected input each.
- **SC-003**: Every place where behavior differs between the official and unofficial WhatsApp channels has a test asserting each branch.
- **SC-004**: The full suite completes fast enough to run on every change (target: under 30 seconds locally on a typical developer machine).
- **SC-005**: The suite is deterministic — running it repeatedly on unchanged code produces the same result every time, with zero flaky tests.
- **SC-006**: When a targeted unit's behavior is changed in a way that breaks its contract, at least one test fails, and the failure names the affected unit.
- **SC-007**: No test performs a real network request or depends on a running backend.

## Assumptions

- The initial scope targets client-side, deterministic logic — validation rules, pure utilities/formatters, custom hooks, and shared presentation components. End-to-end flows, full-page views wired to live data, and visual/pixel regression are out of scope for this iteration.
- Where a component depends on data fetching, the data layer is substituted (mocked) so the test exercises the component in isolation rather than the network.
- "Components" in the request is read broadly as the project's reusable client-side building blocks (validation, utilities, hooks, shared UI), not exclusively React components — because the highest-value, most-testable logic lives in the validation and utility layers.
- The existing authentication reference forms and shared form primitives are treated as the pattern to follow; tests document their current expected behavior rather than proposing behavior changes.
- Coverage is prioritized by risk (validation and channel logic first) rather than by a blanket percentage target for this iteration.

## Explicitly Out of Scope

- End-to-end / integration tests that drive a full page against a live or stubbed backend.
- Visual regression or pixel-snapshot testing.
- Testing generated UI primitives that are owned upstream and not hand-maintained here.
- Load, performance, or accessibility auditing (separate initiatives).
- Backend / Route Handler contract testing beyond confirming the client validates with the shared schema.

## Open Questions

- Is there a target coverage percentage the team wants to enforce in CI, or is risk-prioritized coverage acceptable for this iteration?
- Should shared UI component tests (P4) be committed in this iteration, or deferred to a follow-up once P1–P3 are green?
