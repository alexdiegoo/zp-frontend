# Implementation Plan: WhatsApp Template Management

**Module**: `011-whatsapp-template-management` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)
**Status**: `migrated` — documents the implementation **as built** (commit `f8d6e2e`).

## Summary

Full lifecycle management of official Meta WhatsApp templates: a paginated list with Meta
status, a shared rich editor (header/body/footer/buttons/variables + live preview) for
create and edit, submission to Meta, a sync-from-Meta action, header-image upload, and a
read-only AI-validation feedback panel that polls while processing. Two Zod schemas separate
raw-form validation from the cleaned wire payload.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16 App Router, React 19
**Primary Dependencies**: TanStack Query v5, TanStack Table v8 (`DataTable`), React Hook Form + Zod (`superRefine`), shadcn/ui, `next/image` (preview/QR), lucide-react
**Storage**: none client-side; page in URL; header image uploaded to backend
**Testing**: none present
**Target Platform**: Web
**Project Type**: Web application (Next.js BFF)
**Constraints**: official-only; Meta content rules encoded in Zod; multipart upload path

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Server/Client boundary | ✅ | list/new/detail/edit `page.tsx` are Server Components → client views; list wrapped in `<Suspense>`. |
| II. Route Handlers as BFF | ✅ | `api/templates` (GET/POST), `[id]` (GET/PUT), `[id]/feedback` (GET), `sync` (POST), `upload-header-media` (POST). |
| III. TanStack Query only | ✅ | `useTemplates` (keepPreviousData), `useTemplate`, `useTemplateAiFeedback` (poll while PROCESSING), `useCreateTemplate`/`useUpdateTemplate`/`useSyncTemplates`/`useUploadHeaderMedia`. |
| IV. TanStack Table only | ✅ | List uses shared `DataTable`; columns colocated. |
| V. Paired validation | ✅ | `template.ts`: `createTemplateFormSchema` (raw, superRefine) + `createTemplateSchema` (server) + `templatesQuerySchema` + `syncTemplatesSchema`, all shared. |
| VI. Strict UI composition | ✅ | Editor/preview/buttons/media/feedback composed in `shared/template`; skeletons, alerts, empty states. |
| VII. Theming via tokens | ✅ | Preview + badges via tokens (`text-template-variable`, badge variants). |
| VIII. Strict TypeScript | ✅ | Rich `TemplateDetail`/`TemplateAiFeedback` types; `z.infer` DTOs; no `any`. |
| IX. Context7 | ➖ | Process gate. |
| X. Performance | ✅ | `keepPreviousData`; feedback polls only while PROCESSING; debounced variable extraction; `next/image` for preview/upload. |

No violations requiring an exception.

## Source Code (files that make up this module)

```text
src/
├── app/(app)/templates/
│   ├── {page.tsx, view.tsx}                    # list + Sincronizar
│   ├── _components/columns.tsx
│   ├── new/{page.tsx, view.tsx}                # create (TemplateEditor)
│   └── [id]/
│       ├── {page.tsx, view.tsx}                # detail + preview
│       ├── _components/ai-feedback-section.tsx # AI validation panel (polls while PROCESSING)
│       └── edit/{page.tsx, view.tsx}           # edit (prefilled TemplateEditor)
├── components/shared/template/
│   ├── template-editor.tsx                     # RHF host, variable extraction, submit
│   ├── template-form.tsx                       # the six field sections
│   ├── buttons-section.tsx                     # add/remove quick-reply/URL buttons
│   ├── header-media-upload.tsx                 # PNG/JPEG ≤5MB upload
│   ├── variable-examples-section.tsx           # per-variable example inputs
│   ├── template-preview.tsx / template-message-preview.tsx  # live WhatsApp bubble
├── hooks/queries/use-templates.ts              # list/detail/feedback + create/update/sync/upload
├── lib/validations/template.ts                 # form + server schemas, toCreateTemplatePayload, toTemplateFormValues
├── lib/template-display.ts                     # status/category/language labels, extractTemplateVariables
└── app/api/templates/
    ├── route.ts                                # GET list (400) / POST create (422, 202)
    ├── [id]/route.ts                           # GET detail / PUT update (422, 202)
    ├── [id]/feedback/route.ts                  # GET AI feedback (/ai/ path)
    ├── sync/route.ts                           # POST sync (422) → { syncedCount }
    └── upload-header-media/route.ts            # POST multipart (422) → { url }
```

**Structure Decision**: The editor and preview are `shared/template` components (reused by
create + edit); AI feedback is a route-scoped `_components/`. The largest validation surface
in the app lives in `lib/validations/template.ts`.

## Types & Schemas

- **Zod** (`lib/validations/template.ts`): `createTemplateFormSchema` (superRefine for header/
  URL rules) → `CreateTemplateForm`; `toCreateTemplatePayload` → `CreateTemplatePayload`;
  `toTemplateFormValues` (edit prefill); `createTemplateSchema` (server); `templatesQuerySchema`;
  `syncTemplatesSchema`; plus length/type constants.
- **API types** (`types/api.ts`): `Template`/`TemplateDetail`, `TemplateStatus`/`Category`/
  `HeaderType`, `TemplateAiFeedback`/`AiFeedbackIssue`, `SyncTemplatesResponse`.

## Key implementation decisions (observed)

1. **Two-schema editor** — a raw form schema (with `superRefine` conditional rules and a NONE
   header sentinel) plus a server schema; `toCreateTemplatePayload` cleans/normalizes between them.
2. **Debounced live variable extraction** — avoids throwaway inputs while typing `{{...}}`;
   only in-body variables keep examples on submit.
3. **Read-only AI feedback that self-updates** — `useTemplateAiFeedback` polls every 5s only
   while `status === "PROCESSING"`; a template update (PUT) is what triggers a new run.
4. **Multipart upload path** — `useUploadHeaderMedia` bypasses the JSON helper; the handler
   re-validates type/size and forwards via `apiClient.postForm`.
5. **Backend error passthrough** — create/update surface the backend's message (Meta rejections),
   unlike the generic messages on list/detail/feedback/sync.
6. **Edit coercions** — unsupported header types/categories collapse (see spec Open Question 1).

## Notes for future work

- No delete; VIDEO/DOCUMENT headers and AUTHENTICATION/multi-language authoring unsupported.
- `canSubmit`/`forceSubmitted` AI-override fields unused. No tests.
