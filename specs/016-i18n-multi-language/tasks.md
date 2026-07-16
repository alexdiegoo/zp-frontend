# Tasks: Multi-language support (Brazilian Portuguese and English)

**Input**: Design documents from `/specs/016-i18n-multi-language/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/locale-preference.md, quickstart.md

**Tests**: Targeted tests are included (schema, catalog-parity, formatter, switcher) to match the
project's Testing conventions and the scenarios in quickstart.md — not full TDD.

**Organization**: Tasks are grouped by user story so each story is independently implementable
and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: US1 / US2 / US3 (Setup, Foundational, Polish carry no story label)
- Exact file paths are included in every task.

## Path Conventions

Next.js App Router web app. Frontend source under `src/`; message catalogs under `messages/` at
repo root; feature docs under `specs/016-i18n-multi-language/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install and wire the i18n dependency.

- [X] T001 Install `next-intl` v4: run `pnpm add next-intl` and confirm it appears under `dependencies` in `package.json`.
- [X] T002 Wrap the Next.js config with the plugin in `next.config.ts`: import `createNextIntlPlugin` from `next-intl/plugin`, create `withNextIntl` (default request path `src/i18n/request.ts`), and `export default withNextIntl(nextConfig)`.

**Checkpoint**: `next-intl` installed and the build plugin is active.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core i18n infrastructure required by every user story. No story can start until this
phase is complete.

- [X] T003 [P] Create `src/i18n/config.ts` exporting `LOCALES = ['pt-BR', 'en'] as const`, `DEFAULT_LOCALE = 'pt-BR'`, a `Locale` type, and `LOCALE_LABELS` (`{ 'pt-BR': 'Português (Brasil)', 'en': 'English' }`).
- [X] T004 [P] Create `lib/validations/i18n.ts` exporting `localeSchema = z.enum(LOCALES)` (import `LOCALES` from `src/i18n/config.ts`) — the shared schema for the switcher and the Route Handler (Principle V).
- [X] T005 Create message catalog scaffolds `messages/pt-BR.json` and `messages/en.json` with the namespace skeleton (`common`, `nav`, `auth`, `dashboard`, `leads`, `funnel`, `schedule`, `campaigns`, `templates`, `chat`, `settings`, `validation`) as empty objects, so both files share an identical top-level shape.
- [X] T006 Create `src/i18n/request.ts` with `getRequestConfig`: read the `locale` cookie (fallback `DEFAULT_LOCALE`), dynamically import `messages/${locale}.json`, define named `formats` (`currency` BRL, `shortDate`, `dateTime`, `percent`), and a `getMessageFallback` that returns the `pt-BR` string for a missing key and never a raw key (FR-008). Depends on T003, T005.
- [X] T007 Create `src/global.d.ts` augmenting `next-intl`'s `AppConfig` with `Locale` (from config), `Messages` (`typeof import('../messages/pt-BR.json')`), and `Formats` (`typeof formats`). Depends on T005, T006.
- [X] T008 Update root layout `src/app/layout.tsx`: make it `async`, read the active locale via `getLocale()`, set `<html lang={locale}>` dynamically (replace the hardcoded `pt-BR`), and wrap the body children in `NextIntlClientProvider`. Keep the existing fonts/`Toaster`. Depends on T006.
- [X] T009 Extend the test harness in `src/test/` (`renderWithProviders`) to wrap components in `NextIntlClientProvider` with a fixture message set and a configurable locale, so component tests can resolve translation keys without the network. Depends on T005.

**Checkpoint**: App renders through next-intl with a cookie-driven locale and type-safe keys;
foundation ready for all stories.

---

## Phase 3: User Story 1 - View the application in my preferred language (Priority: P1) 🎯 MVP

**Goal**: The entire interface renders in the active language, and a discoverable switcher
changes the language instantly (no full reload, no lost input).

**Independent Test**: Open any authenticated page, use the switcher to change language, and
confirm all interface text updates immediately while the current page and data stay in place.

### Switch mechanism (US1)

- [X] T010 [US1] Create the Route Handler `src/app/api/preferences/locale/route.ts` (`POST`): parse `locale` with `localeSchema` (422 with `flatten().fieldErrors` on failure), set the `locale` cookie (`httpOnly`, `sameSite='lax'`, `path='/'`, `secure` in prod, `maxAge≈31536000`), and return `{ data: { locale } }`. Keep it thin (Principle II). Depends on T004.
- [X] T011 [US1] Create the query hook `hooks/queries/use-locale.ts`: export `localeKeys` and `useSetLocale()` — a TanStack Query mutation that POSTs to `/api/preferences/locale` and calls `router.refresh()` in `onSuccess` (Principle III; SC-002). Depends on T010.
- [X] T012 [US1] Create the shared switcher `src/components/shared/i18n/locale-switcher.tsx` (`"use client"`): a shadcn `Select`/dropdown listing `LOCALE_LABELS`, that `localeSchema.parse`es the selection before calling `useSetLocale().mutate(...)` (Principle V), disabled while `isPending`, styled with theme tokens only (Principle VII), validated in light & dark. Depends on T011, T003.
- [X] T013 [US1] Mount `<LocaleSwitcher />` in the app shell: add it to `src/components/shared/layout/topbar.tsx` and the mobile menu `src/components/shared/layout/mobile-nav.tsx`. Depends on T012.

### Interface string extraction (US1) — primary journeys (SC-001)

> Each task: move hardcoded UI strings in the listed files into the matching namespace in **both**
> `messages/pt-BR.json` (existing text) and `messages/en.json` (translation), and replace usages
> with `useTranslations(ns)` (client) / `getTranslations(ns)` (server). Business data is never
> translated (FR-010). All are parallel — different files/namespaces.

- [X] T014 [P] [US1] Extract shell/navigation strings (`nav`, `common`) in `src/components/shared/layout/sidebar-nav.tsx`, `sidebar.tsx`, `topbar.tsx`, `mobile-nav.tsx`, and `page-header.tsx`.
- [X] T015 [P] [US1] Extract auth strings (`auth`, `validation`) in `src/app/(auth)/login/view.tsx`, `src/app/(auth)/register/view.tsx`, and wire the auth Zod messages in `lib/validations/auth.ts` to `validation.*` keys resolved via `FormMessage` (research Decision 7).
- [X] T016 [P] [US1] Extract dashboard strings (`dashboard`, `common`) in `src/app/(app)/dashboard/view.tsx` and `src/components/dashboard/metric-card.tsx`.
- [X] T017 [P] [US1] Extract leads/patients strings (`leads`) in `src/app/(app)/patients/view.tsx`, `src/app/(app)/patients/[id]/view.tsx`, and `src/app/(app)/patients/_components/**`.
- [X] T018 [P] [US1] Extract funnel strings (`funnel`) in `src/app/(app)/funnel/view.tsx` and `src/app/(app)/funnel/_components/**`.
- [X] T019 [P] [US1] Extract schedule strings (`schedule`) in `src/app/(app)/schedule/view.tsx` and `src/app/(app)/schedule/_components/**` (procedure-combobox, etc.).
- [X] T020 [P] [US1] Extract campaigns strings (`campaigns`, including official/unofficial `channel` labels) in `src/app/(app)/campaigns/view.tsx`, `campaigns/new/view.tsx`, `campaigns/[id]/view.tsx`, and `campaigns/_components/**` (columns.tsx, etc.).
- [X] T021 [P] [US1] Extract templates strings (`templates`) in `src/app/(app)/templates/view.tsx`, `templates/new/view.tsx`, `templates/[id]/view.tsx`, `templates/[id]/edit/view.tsx`, and `templates/_components/**`.
- [X] T022 [P] [US1] Extract chat strings (`chat`) in `src/app/(app)/chat/view.tsx` and `src/app/(app)/chat/_components/**` (chat-ui.tsx, etc.).
- [X] T023 [P] [US1] Extract settings strings (`settings`) in `src/app/(app)/settings/view.tsx` and `src/app/(app)/settings/_components/**` (integrations-section, connect-whatsapp-dialog, integration-card).
- [X] T024 [P] [US1] Extract shared feedback/empty/error strings (`common`) in `src/components/shared/feedback/**` and any shared `EmptyState`/`Skeleton`/`Alert` copy.
- [ ] T025 [US1] Optimize client payload: in each `view.tsx` (or the `(app)` layout), pass only the needed namespace subset to the client via `NextIntlClientProvider messages={pick(messages, [...])}` where a view is heavy (Principle X). Depends on T014–T024.

### Tests (US1)

- [X] T026 [P] [US1] Unit test `lib/validations/i18n.test.ts`: `localeSchema` accepts `'pt-BR'`/`'en'` and rejects unknown values.
- [X] T027 [P] [US1] Component test `src/components/shared/i18n/locale-switcher.test.tsx` (via extended `renderWithProviders`): selecting a language fires `useSetLocale` with the chosen locale and the control disables while pending.

**Checkpoint**: US1 delivers the MVP — a fully bilingual interface with an instant, in-session
language switch. Independently demoable.

---

## Phase 4: User Story 2 - Have my language choice remembered (Priority: P2)

**Goal**: The chosen language persists across sessions and devices; first-time visitors get a
sensible initial language.

**Independent Test**: Select a language, end the session, return (and sign in on another device)
→ the app opens in the previously selected language; a fresh visitor gets browser-detected or
default language.

- [X] T028 [US2] Extend `src/app/api/preferences/locale/route.ts` to forward the validated `{ locale }` to the backend user-profile endpoint via `apiClient` (durable, cross-device source of truth — FR-005), keeping the cookie set regardless of backend latency. Depends on T010.
- [X] T029 [US2] Seed the `locale` cookie from the user's stored preference in the login Route Handler `src/app/api/auth/login/route.ts`: after a successful login, read the account's `locale` and set the cookie (reuse the cookie-writing helper), so a returning user on any device opens in their saved language (SC-003). Depends on T028.
- [X] T030 [US2] Add first-visit detection in `src/i18n/request.ts`: when no `locale` cookie exists, resolve from the request's `Accept-Language` header if it maps to a supported locale, else `DEFAULT_LOCALE` (FR-006, FR-007, SC-004). Depends on T006.
- [X] T031 [P] [US2] Unit test `src/i18n/request.test.ts` (or a helper extracted for testability): cookie present → that locale; no cookie + `Accept-Language: en` → `en`; no cookie + unsupported → `pt-BR`.

**Checkpoint**: Language preference is durable across sessions and devices, with correct
first-visit defaulting. US1 + US2 form a complete, persistent bilingual experience.

---

## Phase 5: User Story 3 - Locale-correct dates, numbers, and currency (Priority: P3)

**Goal**: Dates, times, numbers, percentages, and currency render in the active language's
conventions.

**Independent Test**: Switch languages and confirm the same date/number/currency values
re-render in the newly selected locale's format without changing the underlying value.

- [X] T032 [US3] Re-source the formatters in `src/lib/format.ts`: replace the hardcoded `pt-BR` `Intl` instances with the active locale via next-intl (`getFormatter`/`useFormatter`) and the named `formats` presets, preserving the `formatDate`/`formatDateTime`/`formatCurrency` signatures and the `—` empty fallback; keep BRL as the currency code while formatting per locale. Leave `formatPhone` unchanged (business data, FR-010). Depends on T006.
- [X] T033 [P] [US3] Audit call sites for inline `Intl`/`toLocaleString`/hardcoded `"pt-BR"` usage (e.g. `src/components/dashboard/metric-card.tsx`, campaign/funnel metric displays) and route them through the `lib/format.ts` wrappers or `useFormatter` presets. Depends on T032.
- [X] T034 [P] [US3] Extend `src/lib/format.test.ts`: add `en`-locale cases alongside the existing pt-BR cases for date, dateTime, currency (BRL), and percent, using the pinned `TZ=America/Sao_Paulo`. Depends on T032.

**Checkpoint**: Formatting is locale-aware across the app; all three user stories complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Guardrails and quality checks spanning all stories.

- [X] T035 [P] Add a catalog-parity test `messages/catalog-parity.test.ts` asserting `messages/pt-BR.json` and `messages/en.json` have identical (deeply-nested) key sets — enforces FR-013 / SC-007 (zero orphaned strings).
- [X] T036 [P] Localize the public privacy page: extract strings in `src/app/(public)/privacidade/view.tsx` and `src/app/(public)/view.tsx` (and `(public)/layout.tsx`) so public pages respect the locale (spec edge case). 
- [X] T037 Localize document metadata: update `generateMetadata`/`metadata` (root `src/app/layout.tsx` title/description and any per-route metadata) to read from translations so titles/descriptions follow the active language.
- [ ] T038 [P] Responsive/overflow pass: verify no truncation, overlap, or clipping of buttons, menu items, table headers, and dialogs in **both** languages across breakpoints and light/dark (FR-012, SC-006); adjust styles with tokens where needed.
- [ ] T039 Run the quickstart.md manual verification checklist end-to-end (switch < 1s no reload & input preserved, zero untranslated fragments across all journeys, cross-device open, first-visit default, business data untranslated, missing-key fallback) and record results. Depends on all prior phases.
- [X] T040 [P] Run `npm test`, `npx tsc --noEmit`, and `npm run lint`; fix any type/lint failures introduced by the i18n changes.

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)**: no dependencies — start immediately.
- **Foundational (Phase 2)**: depends on Setup. **Blocks all user stories.**
- **User Story 1 (Phase 3)**: depends on Foundational. **MVP.**
- **User Story 2 (Phase 4)**: depends on Foundational; builds on the US1 Route Handler (T010). Independent of US3.
- **User Story 3 (Phase 5)**: depends on Foundational (T006). Independent of US1's extraction work and US2.
- **Polish (Phase 6)**: depends on the stories it touches (parity/metadata/overflow after extraction; T039 after all).

### Story independence

- **US1** is fully demoable alone (cookie `maxAge` already persists across browser close within a device).
- **US2** adds cross-device durability + first-visit detection on top of the same handler.
- **US3** (formatting) can be implemented in parallel with US1's string extraction — it only depends on the foundational `request.ts`.

### Within-story parallelism

- Foundational: T003, T004 in parallel; T005 then T006 → T007/T008.
- US1: all extraction tasks T014–T024 run in parallel (distinct files); T025 after them; tests T026/T027 in parallel.
- US2: T031 parallel to handler/login work once logic exists.
- US3: T033/T034 parallel after T032.
- Polish: T035, T036, T038, T040 parallel; T037 and T039 gated as noted.

---

## Parallel Execution Examples

**Foundational kickoff** (after Setup):
```
T003 (i18n/config.ts)  ‖  T004 (lib/validations/i18n.ts)
→ T005 (message scaffolds) → T006 (request.ts) → T007 (global.d.ts) ‖ T008 (root layout)
```

**US1 string extraction fan-out** (after switch mechanism T010–T013):
```
T014 nav ‖ T015 auth ‖ T016 dashboard ‖ T017 leads ‖ T018 funnel ‖
T019 schedule ‖ T020 campaigns ‖ T021 templates ‖ T022 chat ‖ T023 settings ‖ T024 feedback
→ T025 (payload trim) → T026 ‖ T027 (tests)
```

---

## Implementation Strategy

### MVP first (US1 only)

1. Complete Phase 1 (Setup) + Phase 2 (Foundational).
2. Complete Phase 3 (US1) — bilingual UI + instant switch.
3. **STOP and demo/validate**: this is a viable, shippable MVP.

### Incremental delivery

1. Add **US2** (persistence + cross-device + first-visit default) — makes the setting durable.
2. Add **US3** (locale formatting) — completes localization polish.
3. Run **Phase 6** guardrails (catalog parity, metadata, overflow, full verification).

Each story is independently testable and adds a coherent increment of user value.

---

## Implementation Notes (post-run status)

**37/40 tasks complete.** Gates green: `npx tsc --noEmit` clean, `npm test` 169/169 pass
(incl. catalog-parity across all namespaces), `npm run lint` 0 errors (1 pre-existing
TanStack-Table React-Compiler warning), `npm run build` succeeds (41 routes).

Remaining tasks — status:

- **T025 (per-view message payload trim)** — DEFERRED (not blocking). The root
  `NextIntlClientProvider` inherits the full catalog, so all UI strings ship to the client
  (~modest size, heavily compressible). Per-view trimming requires moving the provider into
  each `view.tsx` with a `pick()`ed namespace subset — a broad, risky refactor for a
  performance micro-optimization on an authenticated CRM. Revisit if bundle analysis flags it.
- **T038 (responsive/overflow pass in both languages)** — NEEDS MANUAL QA. Cannot be fully
  verified headlessly. English strings are generally ≤ Portuguese length, so overflow risk is
  low, but a visual pass across breakpoints + light/dark in both languages is still required.
- **T039 (quickstart manual verification checklist)** — NEEDS MANUAL/INTERACTIVE RUN.
  Programmatically verified: build, type-safe keys, catalog parity, formatter locale cases,
  switcher fires the mutation, Accept-Language resolution. Still to confirm by hand with a
  running app + backend: switch < 1s with no reload & input preserved, cross-device open after
  login, and a live missing-key fallback.

**Extra coverage beyond the original task list:** a `procedures` namespace + route extraction,
and a `public` namespace (landing + privacy pages) with localized SEO metadata.
