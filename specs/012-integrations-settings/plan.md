# Implementation Plan: Integrations & Settings

**Module**: `012-integrations-settings` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)
**Status**: `migrated` — documents the implementation **as built** (commit `f8d6e2e`).

## Summary

The settings page hosts an integrations section with three provider cards. Google and Meta
connect via full-page OAuth redirects (the BFF forwards the token and returns the provider's
`Location`; the backend bounces back with success/error flags the view surfaces). Unofficial
WhatsApp (Evolution) connects via an in-app dialog that pairs a device with a QR/pairing code,
polling until linked. Status is aggregated server-side with graceful per-provider degradation.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16 App Router, React 19
**Primary Dependencies**: TanStack Query v5, React Hook Form + Zod (connect dialog), shadcn/ui (Dialog), `next/image` (QR/icons), lucide-react
**Storage**: none client-side; OAuth callback flags via URL params
**Testing**: none present
**Target Platform**: Web
**Project Type**: Web application (Next.js BFF)
**Constraints**: OAuth full-page redirect through the BFF; Evolution polling only while dialog open

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Server/Client boundary | ✅ | `settings/page.tsx` Server Component → `SettingsView` (client, handles OAuth callback params in effects). |
| II. Route Handlers as BFF | ✅ | `api/integrations` (aggregate GET), `/google`, `/meta` (OAuth GET + DELETE), `/whatsapp` (GET/POST/DELETE). OAuth redirects use `apiClient.redirectLocation`. |
| III. TanStack Query only | ✅ | `useIntegrations`, `useEvolutionConnection` (polled while open), `useConnectWhatsApp`, `useDisconnectIntegration`. |
| IV. TanStack Table only | ➖ | No tables. |
| V. Paired validation | ✅ | `connectWhatsAppSchema` shared by the dialog and the whatsapp POST handler (`422`). |
| VI. Strict UI composition | ✅ | `Section`/`PageHeader`; integration card/section; dialog; skeletons; destructive alert. |
| VII. Theming via tokens | ✅ | Card/badge/button variants via tokens. |
| VIII. Strict TypeScript | ✅ | `IntegrationProvider`/`IntegrationsStatus`/`ChannelEvolutionConnection`; no `any`. |
| IX. Context7 | ➖ | Process gate. |
| X. Performance | ✅ | Aggregate via `Promise.allSettled`; Evolution polling scoped to dialog open; `next/image` for QR/icons. |

No violations requiring an exception. (The OAuth-callback effects in `SettingsView` react to
URL params — acceptable given they respond to navigation flags, not data fetching.)

## Source Code (files that make up this module)

```text
src/
├── app/(app)/settings/
│   ├── {page.tsx, view.tsx}                    # SettingsView: OAuth callback toasts + IntegrationsSection
│   └── _components/
│       ├── integrations.config.ts              # INTEGRATIONS list + ConnectKind
│       ├── integrations-section.tsx            # cards; connect (oauth redirect / evolution dialog) / disconnect
│       ├── integration-card.tsx                # status + connect/disconnect button
│       └── connect-whatsapp-dialog.tsx         # RHF phone form → QR/pairing code, poll until linked
├── hooks/queries/use-integrations.ts           # useIntegrations / useEvolutionConnection / useConnectWhatsApp / useDisconnectIntegration
├── lib/validations/integrations.ts             # connectWhatsAppSchema
└── app/api/integrations/
    ├── route.ts                                # GET aggregate (Promise.allSettled, normalized)
    ├── google/route.ts                         # GET OAuth redirect / DELETE (204)
    ├── meta/route.ts                           # GET OAuth redirect / DELETE (204)
    └── whatsapp/route.ts                        # GET connection / POST pair (422, 201) / DELETE (204)
```

**Structure Decision**: Route-scoped `_components/` for the settings surface; the OAuth-callback
URL rewrite (`/companies/:id/settings` → `/settings`) lives in the tenancy `proxy.ts`
([[002-clinic-tenancy-app-shell]]), not here.

## Types & Schemas

- **Zod** (`lib/validations/integrations.ts`): `connectWhatsAppSchema` → `ConnectWhatsAppDto`
  (phone regex).
- **API types** (`types/api.ts`): `IntegrationProvider`, `IntegrationStatus`/`IntegrationsStatus`,
  `GoogleCalendarConnection`, `ChannelConnection` (Meta), `ChannelEvolutionConnection`.

## Key implementation decisions (observed)

1. **Two connect kinds** — `oauth` (full-page redirect via `apiClient.redirectLocation`) vs
   `evolution` (in-app QR dialog); the config drives which path a card uses.
2. **Aggregate with graceful degradation** — `/api/integrations` fans out to the Google and
   WhatsApp connection endpoints with `Promise.allSettled`; a failed provider is reported
   disconnected, and only `{ connected, detail }` reaches the client.
3. **OAuth callback handling split** — google/meta use `?<provider>_connected=true`/
   `?integration_error=<provider>` flags handled in `SettingsView` effects; the tenancy guard
   rewrites the backend's per-company success URL back to `/settings` with the right clinic.
4. **Evolution pairing lifecycle** — polling starts only after a pairing is initiated and only
   while the dialog is open; the dialog resets and removes the evolution query on close.

## Notes for future work

- Only integrations live under settings today (no account/clinic preferences).
- Evolution device status is not tracked outside the dialog. No tests.
