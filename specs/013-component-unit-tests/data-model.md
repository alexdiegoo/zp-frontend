# Phase 1 Data Model: Component Unit Tests

For a testing feature the "data model" is the **inventory of units under test** and the
behavioral contract each test locks down. Grouped by priority slice from the spec.

## Test infrastructure entities

| Entity | Location | Responsibility |
|--------|----------|----------------|
| Jest config | `jest.config.ts` | `next/jest` transform, jsdom env, v8 coverage, `setupFilesAfterEnv` |
| Test setup | `jest.setup.ts` | Load `@testing-library/jest-dom`; reset mocks/timers between tests |
| Provider wrapper | `src/test/utils.tsx` | `renderWithProviders` — fresh `QueryClient` (`retry:false`) + theme provider |
| Fixtures | `src/test/fixtures/*` | Typed domain objects (`Campaign`, `TemplateDetail`, `Appointment`, `WindowStatus`) built against `types/api.ts` |

---

## P1 — Validation rules (`src/lib/validations/`)

One `*.test.ts` per schema module. Each rule asserts ≥1 accepted and ≥1 rejected input with the
expected message (SC-002).

| Unit under test | Key behaviors to lock | Notable edges |
|-----------------|-----------------------|---------------|
| `auth.ts` — `loginSchema` | email required + format, password ≥8 | empty email → "Informe seu e-mail." |
| `auth.ts` — `registerSchema` | name ≥2, **cross-field** password === confirmPassword, error on `confirmPassword` path | mismatch attaches to `confirmPassword` |
| `campaign.ts` — `createCampaignSchema` (discriminated union) | **Official** requires `waPhoneNumberId` + `messageTemplateId` + ≥1 `contactIds`; **Unofficial** requires `message` 10–4096 and forbids the official-only fields | **SC-003 channel branch**: same name, each `apiType` validated against its own shape |
| `campaign.ts` — `campaignsQuerySchema` | `page`/`limit` coercion + bounds, `apiType` enum, `period` default `30d` | `limit` > 100 rejected; string→number coercion |
| `template.ts` — `createTemplateFormSchema` (`superRefine`) | name regex `^[a-z0-9_]+$`, body 1–1024, header `NONE` text caps (length/newline/emoji), `IMAGE` requires `headerMediaUrl`, URL buttons require valid http(s) URL | emoji/newline in header text; URL button missing url |
| `template.ts` — `toCreateTemplatePayload` | `NONE`+text → `TEXT` header; `IMAGE` kept; empty optionals pruned; only in-body variables kept | header sentinel stripped; unused variable example dropped |
| `template.ts` — `templatesQuerySchema`, `syncTemplatesSchema` | limit cap, optional `status` enum, optional `templateId` | — |
| Remaining schemas (`patient`, `procedure`, `appointment`, `clinic`, `funnel`, `chat`, `integrations`, `pre-register`) | required fields, formats (phone/email), enum values per module | null vs empty-string distinction |

---

## P2 — Utility & formatting helpers (`src/lib/`)

| Unit under test | Key behaviors | Edges |
|-----------------|---------------|-------|
| `format.ts` — `formatDate`, `formatDateTime` | ISO → pt-BR `dd/mm/aaaa[ hh:mm]` | null/undefined/invalid → `—` |
| `format.ts` — `formatCurrency` | number → `R$ …` | null/undefined/NaN → `—` |
| `format.ts` — `formatPhone` | 13-digit `55…` → `+55 (AA) …`; 11-digit → `(AA) …`; else raw | null → `—`; unrecognized length returned as-is |
| `template-display.ts` — label/variant getters | known enum → mapped label/variant; **unknown → documented fallback** (`outline`/`secondary`/raw) | unmapped status string |
| `template-display.ts` — `extractTemplateVariables` | `{{var}}` extracted, unique, first-seen order | duplicates deduped; no matches → `[]` |
| `calendar.ts` — date math (`startOfWeek`, `getWeekDays`, `isSameDay`, `isWeekend`, `dayKey`, `slotToDate`, `minutesSinceMidnight`) | Sunday-anchored week; 7 days; slot→time | week/month/year boundaries |
| `calendar.ts` — `formatWeekRange` | collapses shared month/year; expands across boundaries | cross-month, cross-year ranges |
| `calendar.ts` — `layoutDayAppointments` | top/height from start/end; overlapping appts split into side-by-side lanes; min height floor | back-to-back (no overlap) vs overlapping cluster |
| `calendar.ts` — `groupByDay` | groups by local `dayKey` | multiple appts same day |
| `utils.ts` — `cn` | merges + de-conflicts Tailwind classes | later class wins conflict |

---

## P3 — Custom hooks (`src/hooks/ui/`) — fake timers

| Unit under test | Key behaviors | Boundary |
|-----------------|---------------|----------|
| `use-debounce.ts` | output stays at old value until `delay` elapses, then updates to latest; rapid changes reset the timer | before vs at `delay` ms |
| `use-service-window.ts` | `isOpen` true inside window, false past expiry; `remainingLabel` formatting (`Xh Ymin` / `Ymin` / `menos de 1min`); `expiresAt` null when `windowStatus` absent | exactly at `expiresAt` instant → closed |

---

## P4 — Shared UI components (thin slice) — RTL + jsdom

| Unit under test | States / behaviors asserted |
|-----------------|-----------------------------|
| `data-table/data-table.tsx` | `isLoading` → skeleton shown (not rows); empty data → `emptyMessage`; populated → one row per item, cells rendered |
| `layout/page-header.tsx` | renders title + optional description + action slot |
| `campaign/api-type-badge.tsx` | official vs unofficial render distinctly (channel-aware, SC-003 at UI layer) |

---

## Behavioral invariants asserted across the suite

- **Channel duality (SC-003)**: every branch that differs between OFFICIAL and UNOFFICIAL —
  in `createCampaignSchema` and `ApiTypeBadge` — has an assertion for each side.
- **Graceful degradation**: formatters and display helpers return their documented fallback
  (`—`, raw value, `outline`/`secondary`) on null/unknown input rather than throwing.
- **Determinism (SC-005)**: all time-dependent behavior is driven by fake timers / fixed system
  time; no test reads the wall clock.
- **Offline (SC-007)**: no test issues a real request; query hooks are mocked or provided data.
