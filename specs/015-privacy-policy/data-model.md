# Phase 1 Data Model: Privacy Policy Page

**Feature**: `015-privacy-policy` | **Date**: 2026-07-13

This feature has **no persisted data, no API, and no runtime state**. The only "data" is the
static content model that structures the page. It is captured here so the section wrapper and
the view share one typed shape (Principle VIII).

## Entity: PolicySection (presentational)

The unit rendered by `_components/policy-section.tsx`. The view composes an ordered list of
these to form the full document.

| Field | Type | Rules |
|-------|------|-------|
| `id` | `string` | Stable anchor slug (e.g. `"dados-coletados"`), unique per page; used for in-page navigation and deep links. |
| `title` | `string` | pt-BR section heading, rendered as a semantic heading. Required, non-empty. |
| `children` | `React.ReactNode` | The section body (paragraphs, lists), styled with token classes. Required. |

> Modeled as component props, not a data record. No validation library needed — the content
> is authored in-source, so TypeScript props are the contract.

## Entity: PolicyMetadata (page-level values)

Editable values surfaced on the page. Not a runtime record — constants co-located with the
view, isolated so the business can update them without touching structure.

| Field | Type | Rules | Maps to |
|-------|------|-------|---------|
| `controller` | `string` | Legal name of the data controller (company/clinic operator). | FR-009, US3 |
| `contactChannel` | `string` | Privacy contact (e.g. an email address). | FR-009, US3 |
| `effectiveDate` | `string` | Human-readable pt-BR date the policy takes effect / was last updated. | FR-010, US3, edge case "Stale date" |
| `dataDeletion.channel` | `string` | Where a deletion request is sent. | FR-007, US2 |
| `dataDeletion.timeframe` | `string` | Expected handling time for a deletion request. | FR-007, US2 |

## Required section set (ordered)

The view MUST render at least these sections, in order, to satisfy FR-003…FR-010, FR-014 and
SC-002. Each maps to a `PolicySection`:

1. `introducao` — Introduction & scope (who this policy covers).
2. `dados-coletados` — Categories of personal data collected + purpose of each. (FR-003)
3. `uso-dos-dados` — How data is used, incl. WhatsApp campaign dispatch via Meta. (FR-004)
4. `compartilhamento` — Sharing with third parties; names Meta/WhatsApp as processor. (FR-005)
5. `retencao` — Retention period and basis. (FR-006)
6. `seus-direitos` — LGPD rights: access, correction, deletion, portability, consent revocation. (FR-008)
7. `exclusao-de-dados` — Data-deletion instructions: channel, steps, timeframe. (FR-007)
8. `controlador-e-contato` — Controller identity + privacy contact. (FR-009)
9. Effective/last-updated date — rendered in header or footer of the content. (FR-010)

## Relationships

- `PrivacyPolicyView` (Server Component) → renders `LandingHeader`, an ordered list of
  `PolicySection`, and `LandingFooter`.
- `PolicySection` is a leaf presentational component; no dependencies on other entities.
- `PolicyMetadata` values are injected into the relevant sections (deletion, contact, date).

## State transitions

None. Static document; the only "transition" is a content/date edit at authoring time, which
is a source change, not runtime state.
