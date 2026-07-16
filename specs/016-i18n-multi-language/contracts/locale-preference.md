# Contract: Locale Preference & i18n Surface

**Feature**: `016-i18n-multi-language`

This app exposes no public API; the relevant contracts are the internal BFF Route Handler for
the language preference, the cookie contract, and the client-facing i18n primitives. All are
constitution-compliant (Principle II BFF, III TanStack Query, V paired validation).

---

## 1. Route Handler — `POST /api/preferences/locale`

Sets the active language for the current user: validates, sets the cookie, forwards to backend.

**Request body**
```json
{ "locale": "en" }
```

**Validation** (shared `localeSchema = z.enum(['pt-BR','en'])` from `lib/validations/i18n.ts`):
- `locale` — required, must be a supported locale.

**Responses**
| Status | Body | Meaning |
|--------|------|---------|
| `200` | `{ "data": { "locale": "en" } }` | Preference saved; `Set-Cookie: locale=en` on the response. |
| `401` | `{ "error": "unauthorized" }` | No/invalid session (handled by shared 401 flow). |
| `422` | `{ "error": { "locale": ["..."] } }` | Body failed `localeSchema` (`parsed.error.flatten().fieldErrors`). |

**Side effects**
- `Set-Cookie: locale=<value>; Path=/; HttpOnly; SameSite=Lax; Secure(prod); Max-Age≈31536000`.
- Forwards `{ locale }` to the backend user-profile endpoint via `apiClient` (durable,
  cross-device — FR-005). Cookie is set regardless so the current browser reflects it
  immediately even if the backend call is eventually-consistent.

**Handler shape** (thin, per Principle II):
```ts
export async function POST(req: NextRequest) {
  const parsed = localeSchema.safeParse((await req.json())?.locale);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  await apiClient.patch("/me/preferences", { locale: parsed.data }); // durable
  const res = NextResponse.json({ data: { locale: parsed.data } });
  res.cookies.set("locale", parsed.data, { httpOnly: true, sameSite: "lax", path: "/", secure: isProd, maxAge: 31536000 });
  return res;
}
```

---

## 2. Client hook — `useSetLocale` (TanStack Query mutation)

`hooks/queries/use-locale.ts` — the only client path that changes language.

```ts
export const localeKeys = { preference: ["locale", "preference"] as const };

export function useSetLocale() {
  const router = useRouter();
  return useMutation({
    mutationFn: (locale: Locale) =>
      fetch("/api/preferences/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      }).then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
    onSuccess: () => router.refresh(), // re-renders in the new locale, no full reload (SC-002)
  });
}
```

**Contract guarantees**
- Fires only after client-side `localeSchema` parse in the switcher (Principle V).
- `onSuccess` → `router.refresh()`; unsaved form input in client components is preserved
  (FR-004).

---

## 3. Cookie contract — `locale`

| Property | Value |
|----------|-------|
| Name | `locale` |
| Values | `pt-BR` \| `en` |
| Written by | login Route Handler (seed from account), `POST /api/preferences/locale` |
| Read by | `src/i18n/request.ts` (server, every request) |
| Attributes | `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` in prod, `Max-Age≈1y` |
| Absent → | Accept-Language detection → `DEFAULT_LOCALE` (`pt-BR`) |

---

## 4. i18n rendering primitives (internal UI contract)

| Concern | Server Component | Client Component |
|---------|------------------|------------------|
| Translate | `getTranslations(ns)` | `useTranslations(ns)` |
| Format date/number/currency | `getFormatter()` | `useFormatter()` |
| Active locale | `getLocale()` | `useLocale()` |
| Provider | — | `NextIntlClientProvider messages={pick(...)}` in root layout |

**Guarantees**
- Keys are type-checked against `AppConfig.Messages` (compile error on drift — FR-013).
- Missing key → default-locale fallback via `getMessageFallback` (FR-008); never a raw key.
- Namespaces (`common`, `nav`, `auth`, `dashboard`, `leads`, `funnel`, `schedule`, `campaigns`,
  `templates`, `chat`, `settings`, `validation`) match feature areas.

---

## 5. `lib/format.ts` wrapper contract (unchanged signatures)

| Function | Before | After | Note |
|----------|--------|-------|------|
| `formatDate(iso)` | hardcoded `pt-BR` | active-locale formatter | keeps `—` empty fallback |
| `formatDateTime(iso)` | hardcoded `pt-BR` | active-locale formatter | keeps `—` fallback |
| `formatCurrency(v)` | hardcoded `pt-BR`/BRL | active-locale conventions, BRL | keeps `—` fallback |
| `formatPhone(raw)` | BR phone formatting | **unchanged** | business data (FR-010), not UI locale |

Public signatures are preserved so existing call sites keep compiling; only the locale source
changes.
