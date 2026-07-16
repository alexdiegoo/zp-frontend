# Phase 0 Research: Multi-language support (pt-BR / en)

**Feature**: `016-i18n-multi-language` · **Date**: 2026-07-15

All library APIs below were verified via Context7 (`/amannn/next-intl`) per Constitution
Principle IX. No `NEEDS CLARIFICATION` items remain.

---

## Decision 1 — i18n library: `next-intl` (v4)

**Decision**: Adopt `next-intl` as the internationalization layer.

**Rationale**:
- Native App Router + Server Component support; works with both server (`getTranslations`,
  `getFormatter`) and client (`useTranslations`, `useFormatter`) components — the project's
  `page.tsx` (server) / `view.tsx` (client) split (Principle I) is fully supported.
- Provides ICU message syntax (pluralization, gender, interpolation) → satisfies FR-011.
- Built-in `Intl`-based date/number/currency formatting → satisfies FR-009 without hand-rolled
  formatters.
- First-class TypeScript augmentation (`AppConfig`) → keys are type-checked, satisfies
  Principle VIII and FR-013 (missing/renamed keys become compile errors).
- Does **not** overlap any fixed-stack choice (it is not a table, form, data-fetching, or
  styling library), so adding it is **additive**, not a stack deviation.

**Alternatives considered**:
- `react-i18next` / `i18next`: powerful but Server-Component integration in App Router is more
  manual; weaker type-safety story; more boilerplate for SSR locale.
- `next-i18next`: effectively legacy for the Pages Router; not recommended for App Router.
- Hand-rolled context + JSON maps: rejected — reimplements ICU, formatting, fallback, and
  type-safety that next-intl already provides; higher long-term cost.

---

## Decision 2 — Routing strategy: cookie-based, **no `[locale]` URL segment**

**Decision**: Use next-intl's "without i18n routing" setup. Locale is stored in a `locale`
cookie and resolved server-side in `src/i18n/request.ts`; URLs are **not** prefixed with the
locale.

**Rationale**:
- Preserves the existing route-group structure (`(app)`, `(auth)`, `(public)`) and every
  `page.tsx`/`view.tsx` pair unchanged — moving all routes under `app/[locale]/` would be a
  large, invasive restructuring that touches every route and every `Link`.
- Preference is per-user and account-bound (FR-005), not shareable-by-URL, so a URL segment
  buys nothing the product needs.
- No middleware required (Next.js 16 + `createNextIntlPlugin`), keeping `proxy.ts`/auth-gate
  logic as-is.

**Verified pattern** (`src/i18n/request.ts`):
```ts
import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = store.get('locale')?.value ?? 'pt-BR';
  return {locale, messages: (await import(`../../messages/${locale}.json`)).default};
});
```

**Alternatives considered**:
- `[locale]` path segments: better for SEO/shareable localized URLs and automatic
  locale-consistent server actions — but this is an authenticated internal CRM, not a public
  marketing site, so the SEO benefit is marginal and the restructuring cost is high. Rejected.

**Trade-off accepted**: Without a `[locale]` segment, messages produced in a server action are
not auto-reconciled on locale switch. Mitigation: the switch triggers a full re-render via
`router.refresh()`, and transient server-action messages (toasts) are short-lived — no stored
server-rendered message persists across a switch.

---

## Decision 3 — Runtime locale switch: Route Handler + cookie + `router.refresh()`

**Decision**: The language switcher calls a TanStack Query **mutation** hook that POSTs to a
Route Handler `POST /api/preferences/locale`. The handler validates the locale (shared Zod
schema), sets the `locale` cookie, and forwards the preference to the backend. On success the
client calls `router.refresh()`.

**Rationale**:
- Keeps the switch **constitution-compliant**: the client never calls the backend directly
  (Principle II) — it goes client → TanStack Query mutation (Principle III) → Route Handler
  (BFF) → backend. The cookie (server-only concern) is set inside the handler response.
- `router.refresh()` re-runs `getRequestConfig` on the server and re-renders with the new
  messages **without a full page reload**, satisfying SC-002 (< 1s, no reload). React preserves
  client component state across a soft refresh, so **unsaved form input is not lost** (FR-004).
- A plain server action was rejected as the persistence path because Principle II mandates the
  Route Handler BFF for anything that reaches the backend; a Route Handler keeps validation,
  auth-token forwarding, and response shape in one enforced place.

**Verified formatting API**:
```ts
import {useFormatter} from 'next-intl';
const format = useFormatter();
format.number(499.9, {style: 'currency', currency: 'BRL'}); // client
// getFormatter() is the server-component equivalent
```

---

## Decision 4 — Preference persistence: cookie (immediate) + backend account (durable)

**Decision**: Two layers. (1) `locale` cookie — read server-side on every request to render
the right language immediately, including first paint. (2) Backend user profile field — the
durable per-account preference (FR-005, cross-device). On login, the login Route Handler seeds
the `locale` cookie from the user's stored preference.

**Rationale**:
- The cookie alone gives per-browser persistence but not cross-device (FR-005 / SC-003); the
  backend field is the source of truth across devices, and the cookie is the fast per-request
  cache of it.
- First-time visitors (no cookie, no stored preference) fall back to browser `Accept-Language`
  detection, then to the default `pt-BR` (FR-006, FR-007).

**Cookie attributes**: not `httpOnly` is unnecessary (the value is set by the server and only
read server-side in `getRequestConfig`); use `httpOnly: false` is **not** required — set
`sameSite: 'lax'`, `path: '/'`, `secure` in production, `maxAge` ~1 year. The switcher never
reads the cookie in JS (it relies on `router.refresh()`), so `httpOnly: true` is acceptable and
preferred. **Chosen: `httpOnly: true`.**

**Alternatives considered**: `localStorage` — rejected: not readable during SSR, causes a
flash of default-language content before hydration (fails "no untranslated fragments").

---

## Decision 5 — Message organization & fallback

**Decision**: One JSON file per locale under `messages/` (`messages/pt-BR.json`,
`messages/en.json`), namespaced by feature/domain area (e.g. `common`, `nav`, `auth`,
`dashboard`, `leads`, `funnel`, `schedule`, `campaigns`, `templates`, `chat`, `settings`,
`validation`). `pt-BR` is the default and the base for type inference.

**Fallback (FR-008)**: Configure a global `getMessageFallback` in `i18n/request.ts` that returns
the default-locale (`pt-BR`) string when a key is missing in the active locale, and never
renders a raw key. Type-safety (Decision 6) makes most missing keys a build-time error; the
runtime fallback covers the residual case.

**Rationale**: Feature namespaces mirror the route structure, keep files reviewable, and let
each `view.tsx` request only the messages it needs (Principle X — smaller client payload) via
`NextIntlClientProvider messages={pick(messages, [...])}`.

---

## Decision 6 — Type safety

**Decision**: Add `src/global.d.ts` augmenting `next-intl`'s `AppConfig` with
`Locale = 'pt-BR' | 'en'`, `Messages = typeof ptBR`, and `Formats = typeof formats`.

**Verified pattern**:
```ts
declare module 'next-intl' {
  interface AppConfig {
    Locale: 'pt-BR' | 'en';
    Messages: typeof import('./messages/pt-BR.json');
    Formats: typeof formats;
  }
}
```

**Rationale**: `t('some.key')` autocompletes and mistyped/removed keys fail `tsc` — enforces
FR-013 (keys in sync) at compile time and satisfies Principle VIII.

---

## Decision 7 — Localized Zod validation messages (shared schema constraint)

**Decision**: Zod schemas in `lib/validations/` continue to be the single shared source
(Principle V). Validation messages are stored as **message keys** (e.g.
`"validation.email.invalid"`), and the client resolves them to the active language in the form
layer via `FormMessage` + a small `t()`-based resolver; the Route Handler returns the key (or
default-locale text) since server-side validation is for security, not display.

**Rationale**: Keeps one schema for client + server (no duplication) while allowing the *display*
of the message to be localized. Avoids embedding locale into the schema itself (which would
break the "one shared schema" rule).

**Alternatives considered**: `z.setErrorMap` with a translator injected per-render — viable but
more global state; revisit during implementation if the key-based approach is noisy. Documented
as the fallback approach, not the primary one.

---

## Decision 8 — Migrating existing hardcoded pt-BR text & formatters

**Decision**:
- Extract existing hardcoded Portuguese UI strings into `messages/pt-BR.json`, and author the
  `en.json` counterparts (FR-013, "existing content backfill" assumption).
- Replace the hardcoded `Intl` formatters in `src/lib/format.ts` with next-intl formatting:
  keep the `formatDate`/`formatDateTime`/`formatCurrency` wrapper names (and the `—` empty
  fallback) but source the locale from next-intl instead of a hardcoded `"pt-BR"`. `formatPhone`
  stays as-is — it formats **business data** (a stored WhatsApp number), which FR-010 excludes
  from localization.
- Set `<html lang={locale}>` dynamically in the root layout (currently hardcoded `pt-BR`).

**Rationale**: Centralizing formatting on the active locale is the whole point of FR-009; the
phone helper is domain data formatting, not UI locale, so it is intentionally left untouched.

---

## Summary of resolved unknowns

| Unknown | Resolution |
|---------|-----------|
| Which i18n library | `next-intl` v4 (Decision 1) |
| URL locale segment vs cookie | Cookie-based, no `[locale]` segment (Decision 2) |
| How the switch stays constitution-compliant | Route Handler + mutation + `router.refresh()` (Decision 3) |
| Cross-device persistence | Backend account field + cookie cache (Decision 4) |
| Missing-translation behavior | `getMessageFallback` → default locale (Decision 5) |
| Key drift prevention | `AppConfig` type augmentation (Decision 6) |
| Localized Zod messages under one shared schema | Message-key approach resolved in form layer (Decision 7) |
| Existing pt-BR content & formatters | Extract to messages; locale-source the formatters (Decision 8) |
