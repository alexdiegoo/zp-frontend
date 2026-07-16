# Feature Specification: Multi-language support (Brazilian Portuguese and English)

**Feature Branch**: `016-i18n-multi-language`  
**Created**: 2026-07-15  
**Status**: Draft  
**Input**: User description: "Implement multi-language support (Brazilian Portuguese and English)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View the application in my preferred language (Priority: P1)

A clinic team member opens the application and sees the entire interface — navigation, page titles, buttons, form labels, table headers, empty states, validation messages, and system notifications — presented in a supported language. They can switch between Brazilian Portuguese and English at any time, and the choice takes effect immediately across the whole application without losing their place or unsaved work.

**Why this priority**: This is the core of the feature. Without the ability to render the interface in a chosen language and switch between the two supported languages, nothing else in this feature delivers value. It is the minimum viable slice: a bilingual interface with a working language switch.

**Independent Test**: Can be fully tested by opening any authenticated page, switching the language from a visible control, and confirming that all visible interface text changes to the selected language while the current page and its data remain in place.

**Acceptance Scenarios**:

1. **Given** a user viewing any page in Brazilian Portuguese, **When** they switch the language to English, **Then** all interface text on the current page updates to English immediately without a full navigation or data reload.
2. **Given** a user viewing the application in English, **When** they navigate to another section, **Then** the new section is also displayed in English.
3. **Given** a supported language is active, **When** the user views forms, tables, menus, and messages, **Then** every piece of application-generated text is shown in that language with no untranslated fragments visible.

---

### User Story 2 - Have my language choice remembered (Priority: P2)

A clinic team member selects their preferred language once and expects it to persist. When they close the browser and return later, or sign in from another device, the application opens in the language they last chose rather than reverting to a default.

**Why this priority**: Persisting the preference turns a one-time switch into a durable setting, which is what makes the feature usable day to day. It builds directly on Story 1 but is separable — the switch can work before persistence is added.

**Independent Test**: Can be tested by selecting a language, ending the session (closing the browser / signing out), returning to the application, and confirming it opens in the previously selected language.

**Acceptance Scenarios**:

1. **Given** a user who selected English, **When** they close and reopen the application later, **Then** the application opens in English.
2. **Given** a user who changed their language preference, **When** they sign in on a different device, **Then** the application reflects their most recently chosen language.
3. **Given** a first-time visitor with no saved preference, **When** they open the application, **Then** the interface is shown in the default language per the detection rules described in the requirements.

---

### User Story 3 - See dates, numbers, and currency in the correct local format (Priority: P3)

A clinic team member reviewing dashboards, funnels, appointment times, and campaign metrics sees dates, times, numbers, percentages, and monetary values formatted according to the active language's regional conventions, so the data reads naturally and is not misinterpreted.

**Why this priority**: Correct locale formatting removes ambiguity (for example, decimal separators and date order) and completes the localization experience, but the interface is already usable and valuable with Stories 1 and 2 alone.

**Independent Test**: Can be tested by switching languages and confirming that dates, times, numbers, percentages, and currency values re-render using the conventions of the newly selected language.

**Acceptance Scenarios**:

1. **Given** Brazilian Portuguese is active, **When** a monetary value is displayed, **Then** it appears in Brazilian Real conventions (for example, `R$ 1.234,56`).
2. **Given** English is active, **When** a date is displayed, **Then** it uses the English-locale date and time conventions.
3. **Given** a user switches language, **When** they view the same numeric or date value, **Then** its formatting updates to match the newly selected language without changing the underlying value.

---

### Edge Cases

- **Missing translation**: When a piece of text has no translation available in the active language, the system shows a sensible fallback (the default-language text) rather than a blank, a raw key, or a broken layout.
- **Unsupported requested language**: When a browser or saved preference requests a language that is not supported, the system falls back to the default language.
- **Long-text overflow**: Translated strings that are longer than the original (common between English and Portuguese) must not truncate awkwardly, overlap, or break the layout of buttons, menus, and tables.
- **Mixed content**: User-entered and backend-provided data (lead names, notes, campaign message bodies, template content) is displayed as stored and is not machine-translated; only application-generated interface text is localized.
- **Switch during unsaved work**: Changing the language while a form has unsaved input must not discard the user's entered values.
- **Pluralization and grammar**: Counts and quantities (for example, "1 lead" vs. "3 leads") read grammatically correctly in each language.
- **Shared/public pages**: Public pages (for example, the privacy policy) also respect the language selection or a language indicated in their address.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST support two languages: Brazilian Portuguese and English.
- **FR-002**: The system MUST display all application-generated interface text — navigation, headings, buttons, labels, placeholders, descriptions, table headers, empty states, tooltips, confirmation dialogs, validation messages, and system notifications (toasts/alerts) — in the active language.
- **FR-003**: Users MUST be able to change the active language from a clearly discoverable control available throughout the authenticated application.
- **FR-004**: Switching the language MUST update the interface immediately across the current view without discarding the current page context or unsaved form input.
- **FR-005**: The system MUST persist a signed-in user's language preference so it is applied on subsequent sessions and across devices.
- **FR-006**: For a visitor with no saved preference, the system MUST determine an initial language by detecting the browser's preferred language and, if it is not a supported language, falling back to the default language.
- **FR-007**: The default language MUST be Brazilian Portuguese.
- **FR-008**: When a translation is missing for the active language, the system MUST fall back to the default-language text and MUST NOT display raw identifiers, blanks, or broken layout.
- **FR-009**: The system MUST format dates, times, numbers, percentages, and currency according to the conventions of the active language.
- **FR-010**: The system MUST NOT translate user-entered or backend-provided business data (for example, lead/patient names, notes, campaign message content, template bodies); such content is shown as stored.
- **FR-011**: The system MUST render counts and quantities with grammatically correct pluralization for each supported language.
- **FR-012**: The layout MUST accommodate text-length differences between languages without truncation, overlap, or clipping of interactive elements.
- **FR-013**: The system MUST keep the two languages' translated content in sync so that every interface string available in one language is available in the other (or falls back per FR-008).
- **FR-014**: Language selection MUST apply consistently in both light and dark themes and across all supported device sizes.

### Key Entities *(include if feature involves data)*

- **Supported Language**: A language the application can present. Attributes: identity (Brazilian Portuguese, English), display name shown in the switcher, and whether it is the default.
- **User Language Preference**: The chosen language associated with a signed-in user. Attributes: the selected language and the fact that it persists across sessions and devices; used to determine which language to present on load.
- **Translatable Text Set**: The collection of application-generated interface strings, each identified so it can be presented in every supported language and resolved via fallback when a translation is missing.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of application-generated interface text visible in the primary user journeys (authentication, dashboard, leads/patients, funnel, schedule, campaigns, templates, chat, settings) is presented in the active language, with zero untranslated fragments.
- **SC-002**: A user can change the language and see the full interface update in under 1 second, without a full page reload and without losing unsaved input.
- **SC-003**: A returning signed-in user opens the application in their previously selected language on 100% of sessions, including from a different device.
- **SC-004**: A first-time visitor whose browser prefers a supported language sees the interface in that language on first load; otherwise they see the default language.
- **SC-005**: 100% of displayed dates, numbers, percentages, and currency values match the active language's regional formatting conventions.
- **SC-006**: No interface element (button, menu item, table header, dialog) is truncated, overlapped, or clipped in either language across supported device sizes and both themes.
- **SC-007**: Every interface string present in one language has a counterpart (or a defined fallback) in the other, verified with zero orphaned strings.

## Assumptions

- **Scope of translation**: Only application-generated interface text is localized. User-entered and backend-provided business data (lead/patient records, notes, campaign message bodies, WhatsApp template content) is displayed as stored and is out of scope for machine translation.
- **Languages**: The initial release supports exactly two languages — Brazilian Portuguese (default) and English. The design should not preclude adding more languages later, but no additional languages are in scope now.
- **WhatsApp campaign/template content**: Localization applies to how the app's interface is presented, not to the content sent to leads. Campaign and template message text authored by users remains as authored; official-API template approval and messaging-window rules are unaffected by this feature.
- **Preference storage**: A signed-in user's language preference is stored with their account so it applies across devices; an initial/anonymous choice may be remembered in the browser until the user signs in.
- **Detection basis**: Initial language for users without a saved preference is derived from the browser's reported language preferences.
- **Existing content backfill**: Interface text currently written in a single language will be migrated into the translatable text set for both languages as part of delivering this feature.
- **Formatting authority**: Regional formatting for each language follows standard conventions (Brazilian Portuguese → Brazil conventions and Brazilian Real; English → standard English-locale conventions).
