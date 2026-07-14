# Quickstart: Privacy Policy Page

**Feature**: `015-privacy-policy` | **Date**: 2026-07-13

How to build, run, and verify the `/privacidade` page.

## What you're building

A static, public, pt-BR privacy policy page under the existing `(public)` route group, plus
a one-line wiring of the footer link. No backend, no data fetching, no forms.

## Files

| File | Action | Purpose |
|------|--------|---------|
| `src/app/(public)/privacidade/page.tsx` | create | Server Component shell; exports `metadata`, renders `<PrivacyPolicyView/>`. |
| `src/app/(public)/privacidade/view.tsx` | create | Server Component; composes `LandingHeader` + ordered `PolicySection`s + `LandingFooter`. Named export `PrivacyPolicyView`. |
| `src/app/(public)/privacidade/_components/policy-section.tsx` | create | Presentational section wrapper (anchor `id`, heading, token-styled body). |
| `src/components/landing/landing-footer.tsx` | edit | Point the "Política de privacidade" link from `href="#"` to `/privacidade`. |
| `src/app/(public)/privacidade/view.test.tsx` | create | Verify required sections, headings/anchors, and Meta/WhatsApp mention. |
| `src/components/landing/landing-footer.test.tsx` | create/edit | Verify the footer link points to `/privacidade`. |

## Build notes (constitution-aligned)

- **Do not** add `"use client"` — both `page.tsx` and `view.tsx` are Server Components
  (static content; Principle X). Recorded deviation from Principle I in `plan.md`.
- **Tokens only** for all styling (`text-foreground`, `text-muted-foreground`, `border-border`,
  etc.); no hardcoded colors (Principle VII). Validate dark mode.
- **No `prose` plugin** — style headings/paragraphs/lists explicitly in `policy-section.tsx`.
- Keep controller name, contact channel, and effective date as clearly editable constants so
  legal copy can be swapped without structural change.
- Before touching the `Metadata` export or any App Router API, confirm the signature via
  Context7 (`/vercel/next.js`) per Principle IX.

## Run it

```bash
npm run dev
# open http://localhost:3000/privacidade
```

## Manual verification (against the route contract)

1. **Anonymous access (C-001)**: In a private/incognito window with no session, open
   `/privacidade` → the full policy renders, no redirect to `/login`.
2. **Server-rendered content (C-002, C-004)**:
   ```bash
   curl -s http://localhost:3000/privacidade | grep -i "exclusão de dados"
   ```
   → the deletion section text is present in the raw HTML (proves it's not client-gated).
3. **Sections present (C-004, C-005, C-006)**: Confirm all required section headings appear,
   the sharing section names Meta/WhatsApp, and the deletion section states channel + steps +
   timeframe.
4. **Mobile (C-007)**: At a 375px viewport, no horizontal scroll; text readable.
5. **Footer wiring (C-009)**: From the landing page, click "Política de privacidade" in the
   footer → lands on `/privacidade`.
6. **Metadata (C-008)**: Browser tab title reads `Política de Privacidade · ZapBlast`.

## Tests

```bash
npm test -- privacidade landing-footer
```

Assertions:
- The view renders each required section heading / anchor `id`.
- The sharing section mentions Meta / WhatsApp.
- The deletion section mentions the contact channel and a timeframe.
- The footer link `href === "/privacidade"`.

## Done when

- All route-contract guarantees (C-001…C-009) hold.
- All spec success criteria (SC-001…SC-006) are demonstrable.
- Tests pass; dark mode validated; no hardcoded colors; no `"use client"` in this route.
