# Phase 1 Data Model: Multi-language support

**Feature**: `016-i18n-multi-language` · **Date**: 2026-07-15

This feature is primarily a presentation-layer concern. The "data" consists of a small set of
configuration/preference entities plus the translatable message catalog. No new backend domain
tables are introduced by the frontend; the durable preference lives on the existing user
profile.

---

## Entity 1 — SupportedLanguage (static configuration)

A language the application can present. Defined in code as a fixed enum, not stored per-record.

| Field | Type | Rules |
|-------|------|-------|
| `code` | `'pt-BR' \| 'en'` | The two supported locales (FR-001). BCP-47 codes. |
| `label` | string | Native display name in the switcher (e.g. "Português (Brasil)", "English"). |
| `isDefault` | boolean | Exactly one is default; `pt-BR` (FR-007). |

**Source of truth**: `src/i18n/config.ts` exports `LOCALES = ['pt-BR', 'en'] as const`,
`DEFAULT_LOCALE = 'pt-BR'`, and a `LOCALE_LABELS` map.

**Validation**: `localeSchema = z.enum(LOCALES)` in `lib/validations/i18n.ts` — shared by the
switcher and the Route Handler (Principle V).

---

## Entity 2 — UserLanguagePreference

The chosen locale associated with a signed-in user (FR-005).

| Field | Type | Rules |
|-------|------|-------|
| `locale` | `Locale` | Must be a `SupportedLanguage.code`; validated via `localeSchema`. |

**Persistence layers** (Decision 4 in research):
1. **Cookie** `locale` — server-readable, set by the login handler and the preference handler;
   `httpOnly`, `sameSite=lax`, `path=/`, `secure` in prod, `maxAge ≈ 1 year`. Read in
   `src/i18n/request.ts` on every request.
2. **Backend account field** — durable, cross-device source of truth. Read on login to seed the
   cookie; written when the user changes language.

**Resolution order on load** (FR-006, FR-007):
```
locale cookie
  → (else) backend stored preference (seeded into cookie at login)
  → (else) browser Accept-Language, if a supported locale
  → (else) DEFAULT_LOCALE (pt-BR)
```

**State transition**:
```
[active locale A]
   -- user selects locale B in switcher -->
[mutation POST /api/preferences/locale {locale: B}]
   -- handler validates + sets cookie + forwards to backend -->
[router.refresh()] --> getRequestConfig re-reads cookie --> [active locale B]
```
Invariant: a switch never discards unsaved client form state (soft refresh, FR-004).

---

## Entity 3 — TranslatableTextSet (message catalog)

The collection of application-generated interface strings, one catalog per locale.

| Aspect | Detail |
|--------|--------|
| Storage | `messages/pt-BR.json`, `messages/en.json` (JSON, ICU message syntax). |
| Structure | Namespaced by area: `common`, `nav`, `auth`, `dashboard`, `leads`, `funnel`, `schedule`, `campaigns`, `templates`, `chat`, `settings`, `validation`. |
| Key | Dot-path within a namespace, e.g. `campaigns.channel.official`. |
| Base/type source | `pt-BR.json` is the type base (`AppConfig.Messages`). |
| Sync rule (FR-013) | Every key present in the base must exist in every other locale; enforced at compile time via `AppConfig` augmentation + a CI/test check. |
| Fallback rule (FR-008) | Missing key → `getMessageFallback` returns the `pt-BR` string; never a raw key or blank. |

**Not translated (FR-010)**: user/backend business data — lead/patient names, notes, campaign
message bodies, WhatsApp template content, stored phone numbers. These pass through unchanged.

---

## Entity 4 — LocaleFormats (formatting configuration)

Named format presets consumed by `useFormatter`/`getFormatter` (FR-009).

| Preset | Kind | pt-BR example | en example |
|--------|------|---------------|-----------|
| `currency` | number/currency | `R$ 1.234,56` (BRL) | `$1,234.56` (USD)* |
| `shortDate` | date | `15/07/2026` | `07/15/2026` |
| `dateTime` | date+time | `15/07/2026 14:30` | `07/15/2026 2:30 PM` |
| `percent` | number | `12,5%` | `12.5%` |

*Currency: monetary amounts in this clinic CRM are BRL regardless of UI language; the
**formatting conventions** (separators, symbol placement) follow the active locale while the
currency code stays `BRL`. Confirmed against the "Formatting authority" assumption — presenting
BRL amounts, formatted per locale. Defined in `src/i18n/request.ts` `formats`.

---

## Relationships

```
SupportedLanguage (2 static rows: pt-BR default, en)
        ▲                         ▲
        │ code                    │ code
UserLanguagePreference      LocaleFormats (per locale)
        │
        │ selects which catalog renders
        ▼
TranslatableTextSet (one catalog per SupportedLanguage)
```
