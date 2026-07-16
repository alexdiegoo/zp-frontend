# Implementation Plan: Multi-language support (Brazilian Portuguese and English)

**Branch**: `016-i18n-multi-language` | **Date**: 2026-07-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/016-i18n-multi-language/spec.md`

## Summary

Add bilingual (Brazilian Portuguese default + English) support to the ZapBlast frontend using
**`next-intl` v4** in its **cookie-based, no-`[locale]`-segment** configuration. Locale is
resolved server-side from a `locale` cookie in `src/i18n/request.ts`; the durable per-account
preference lives on the backend user profile and seeds the cookie at login. A shared
`<LocaleSwitcher>` changes the language via a TanStack Query mutation → `POST /api/preferences/locale`
Route Handler (validates with a shared Zod schema, sets the cookie, forwards to backend) →
`router.refresh()`, giving an instant, no-reload switch that preserves unsaved form input.
Existing hardcoded Portuguese UI strings are extracted into namespaced `messages/*.json`
catalogs, and the `lib/format.ts` date/number/currency helpers are re-sourced from the active
locale (phone formatting stays as business data). Type-safe keys and a default-locale fallback
prevent drift and untranslated fragments.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19.2, Next.js 16.2 (App Router)
**Primary Dependencies**: `next-intl` v4 (new); existing TanStack Query v5, React Hook Form v7 + Zod v4, shadcn/ui, Tailwind v4
**Storage**: `locale` httpOnly cookie (per-request) + backend user-profile field (durable, cross-device); message catalogs as `messages/*.json`
**Testing**: Jest + React Testing Library (`renderWithProviders` extended to wrap `NextIntlClientProvider`); catalog-parity + schema + formatter tests
**Target Platform**: Modern browsers (mobile-first responsive), SSR via Next.js server runtime
**Project Type**: Web application (Next.js App Router frontend / BFF)
**Performance Goals**: Language switch renders in < 1s without full page reload (SC-002); only per-view message subsets shipped to the client
**Constraints**: No `[locale]` URL restructuring; no client→backend direct calls; unsaved form input preserved on switch; zero untranslated fragments / no raw keys
**Scale/Scope**: 2 locales; ~11 route areas (auth, dashboard, leads/patients, funnel, schedule, campaigns, templates, chat, settings, public); message namespaces per area

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| # | Principle | Assessment |
|---|-----------|------------|
| I | Explicit Server/Client Boundary | ✅ `page.tsx` files stay Server Components; provider added in the (already server) root `layout.tsx`; `<LocaleSwitcher>` is a client component used inside views. No `page.tsx` gains `"use client"`. |
| II | Route Handlers as BFF | ✅ Locale persistence goes through `POST /api/preferences/locale`; the client never calls the backend directly. Cookie is set inside the handler. A plain server action was **rejected** for the backend call to honor this principle. |
| III | TanStack Query — sole data fetching | ✅ The switch uses a `useSetLocale` mutation hook with a `localeKeys` factory. No raw fetch in components; message loading is server-side via `getRequestConfig` (not client data fetching). |
| IV | TanStack Table — sole table impl | ✅ Not affected; existing tables unchanged. |
| V | Paired client + server validation | ✅ `localeSchema` in `lib/validations/i18n.ts` is shared by the switcher and the Route Handler. Zod validation messages become localizable via message keys resolved in the form layer (research Decision 7), keeping one shared schema. |
| VI | Strict UI composition | ✅ `<LocaleSwitcher>` lives in `components/shared/i18n/` (mounted in the app shell — topbar + mobile nav). Uses shadcn primitives + tokens. |
| VII | Theming only through tokens | ✅ Switcher styled with tokens; validated in light & dark (SC-006). |
| VIII | Strict TypeScript | ✅ `AppConfig` augmentation makes message keys and locales type-checked; no `any`. |
| IX | Library docs verified (Context7) | ✅ `next-intl` App Router / cookie setup, `useFormatter`, and `AppConfig` typing verified via `/amannn/next-intl` (see research.md). |
| X | Performance by default | ✅ Messages loaded server-side per request; each view receives only its namespace subset via `pick`; no large client bundle. |

**Fixed-stack note**: `next-intl` does **not** overlap any fixed-stack choice (it is not a table,
form, data-fetching, or styling library). It is an **additive** dependency, not a stack
deviation. No exception required.

**Gate result**: PASS — no violations. Complexity Tracking left empty.

## Project Structure

### Documentation (this feature)

```text
specs/016-i18n-multi-language/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── locale-preference.md   # Route Handler, cookie, hook, i18n primitives contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist (from /speckit.specify)
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
messages/
├── pt-BR.json                       # default catalog, type base
└── en.json                          # English catalog

src/
├── i18n/
│   ├── config.ts                    # LOCALES, DEFAULT_LOCALE, LOCALE_LABELS
│   └── request.ts                   # getRequestConfig: cookie→locale, messages, formats, fallback
├── global.d.ts                      # next-intl AppConfig augmentation
├── app/
│   ├── layout.tsx                   # (CHANGED) NextIntlClientProvider + dynamic <html lang>
│   └── api/
│       └── preferences/
│           └── locale/
│               └── route.ts         # (NEW) POST — validate, set cookie, forward to backend
├── components/
│   └── shared/
│       └── i18n/
│           └── locale-switcher.tsx  # (NEW) client language switcher
├── hooks/
│   └── queries/
│       └── use-locale.ts            # (NEW) useSetLocale mutation + localeKeys
├── lib/
│   ├── validations/
│   │   └── i18n.ts                  # (NEW) localeSchema (shared)
│   └── format.ts                    # (CHANGED) locale-sourced date/number/currency
└── app/(app|auth|public)/**         # (CHANGED incrementally) hardcoded strings → t(...)

next.config.ts                       # (CHANGED) wrap with createNextIntlPlugin
```

**Structure Decision**: Web application (Next.js App Router). The existing route-group layout
(`(app)`, `(auth)`, `(public)`) is **preserved** — the cookie-based next-intl setup avoids a
`[locale]` segment, so no routes move. New i18n concerns are isolated under `src/i18n/`,
`messages/`, a shared `components/shared/i18n/` component, one query hook, one validation schema,
and one Route Handler. UI string extraction happens incrementally per route area (prioritized by
the spec's user journeys).

## Implementation Phasing (for /speckit.tasks)

Aligned to the spec's prioritized user stories so each slice is independently shippable:

- **Foundation** (blocks all stories): install next-intl, `next.config.ts` plugin, `src/i18n/`
  (`config.ts`, `request.ts` with fallback + formats), `global.d.ts`, root-layout provider +
  dynamic `<html lang>`, seed `messages/pt-BR.json` from existing strings + `en.json` shell.
- **US1 (P1) — bilingual UI + instant switch**: `localeSchema`, `POST /api/preferences/locale`,
  `useSetLocale`, `<LocaleSwitcher>` in the app shell; extract strings for the primary journeys;
  `router.refresh()` switch. Delivers the MVP.
- **US2 (P2) — persisted preference**: seed cookie from backend at login; forward preference to
  backend in the handler; Accept-Language detection for first-time visitors.
- **US3 (P3) — locale formatting**: re-source `lib/format.ts` from the active locale; apply named
  `formats` presets; add `en` formatter tests + catalog-parity test.

## Complexity Tracking

> No Constitution Check violations. No entries required.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
