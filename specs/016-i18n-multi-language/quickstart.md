# Quickstart: Multi-language support (pt-BR / en)

**Feature**: `016-i18n-multi-language`

How the i18n layer fits together and how to work with it. Verify library APIs via Context7
(`/amannn/next-intl`) before editing i18n code (Principle IX).

---

## 1. Install & wire the plugin

```bash
npm install next-intl
```

`next.config.ts`:
```ts
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin(); // points at src/i18n/request.ts by default
export default withNextIntl(nextConfig);
```

## 2. Files this feature adds/changes

```
messages/
├── pt-BR.json                 # default locale, type base
└── en.json                    # English catalog (same key shape)
src/
├── i18n/
│   ├── config.ts              # LOCALES, DEFAULT_LOCALE, LOCALE_LABELS
│   └── request.ts             # getRequestConfig: cookie → locale, messages, formats, fallback
├── global.d.ts                # AppConfig augmentation (Locale, Messages, Formats)
├── app/
│   ├── layout.tsx             # NextIntlClientProvider + <html lang={locale}>  (CHANGED)
│   └── api/preferences/locale/route.ts   # POST: validate + set cookie + forward
├── components/shared/i18n/
│   └── locale-switcher.tsx    # client switcher (uses useSetLocale)
├── hooks/queries/use-locale.ts           # useSetLocale mutation
├── lib/
│   ├── validations/i18n.ts    # localeSchema (shared client + handler)
│   └── format.ts              # locale-sourced formatters  (CHANGED)
```

## 3. Add a translatable string

1. Add the key under the right namespace in **both** `messages/pt-BR.json` and `messages/en.json`
   (build fails if the base key is missing in a locale — FR-013).
   ```jsonc
   // pt-BR.json → "leads": { "newButton": "Novo lead" }
   // en.json    → "leads": { "newButton": "New lead" }
   ```
2. Use it:
   ```tsx
   // client (view.tsx / _components)
   const t = useTranslations("leads");
   <Button>{t("newButton")}</Button>

   // server component
   const t = await getTranslations("leads");
   ```

## 4. Format a value

```tsx
const format = useFormatter();               // or getFormatter() on the server
format.dateTime(new Date(iso), "shortDate"); // named preset from i18n/request.ts formats
format.number(amount, "currency");           // BRL, active-locale conventions
```
Or keep using the `lib/format.ts` wrappers (`formatDate`, `formatCurrency`, …) — now
locale-aware — at existing call sites.

## 5. The language switcher

`<LocaleSwitcher />` (a shared component) lives in the app shell (topbar + mobile nav). It:
1. `localeSchema.parse(selected)` before firing (Principle V),
2. calls `useSetLocale().mutate(locale)`,
3. `onSuccess` → `router.refresh()` → UI re-renders in the new language, no full reload,
   unsaved form input preserved.

## 6. Manual verification (maps to Success Criteria)

- [ ] Switch language on any page → full UI updates < 1s, no reload, page & data stay (SC-002, US1).
- [ ] Type into a form, switch language → input is preserved (FR-004).
- [ ] Every primary journey (auth, dashboard, leads, funnel, schedule, campaigns, templates,
      chat, settings) shows zero untranslated fragments in both languages (SC-001).
- [ ] Close/reopen browser and sign in on another device → opens in last-chosen language (SC-003).
- [ ] Fresh browser with `en` preference → loads in English; otherwise pt-BR (SC-004).
- [ ] Dates/numbers/percent/currency match the active locale (SC-005); BRL amounts stay BRL.
- [ ] No truncation/overlap in either language, light & dark, across breakpoints (SC-006).
- [ ] Business data (lead names, campaign/template bodies, phone numbers) is NOT translated (FR-010).
- [ ] Temporarily remove a key from `en.json` → default pt-BR text shows, never a raw key (FR-008).

## 7. Testing notes (per project Testing conventions)

- Wrap components under test in `NextIntlClientProvider` (extend `renderWithProviders`) with a
  fixture message set; assert on rendered text keys resolve.
- `localeSchema` gets a unit test (accepts `pt-BR`/`en`, rejects others).
- Formatter tests keep `TZ=America/Sao_Paulo`; add an `en` case alongside the existing pt-BR
  cases in `format.test.ts`.
- A catalog-parity test asserts `en.json` and `pt-BR.json` have identical key sets (FR-013).
