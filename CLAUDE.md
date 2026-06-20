# Frontend Project — Claude Code Context

## Project Context — What We're Building

This is the frontend for **ZapBlast**, a **CRM for clinics** that manages and optimizes the
full patient journey while powering WhatsApp marketing at scale.

### Domain — the patient/lead lifecycle

The product tracks a contact through every stage and surfaces metrics at each step:

1. **Lead intake** — a lead enters the funnel (ad, referral, WhatsApp, manual entry).
2. **Qualification & follow-up** — the team works the lead through the pipeline stages.
3. **Scheduling** — the lead books an appointment / procedure.
4. **Procedure execution** — the scheduled procedure is carried out at the clinic.
5. **Post-procedure & retention** — follow-up, recurring care, re-engagement.

The goal is to **optimize the end-to-end process** and **guarantee visibility into
metrics** (conversion per stage, no-show rate, time-to-schedule, revenue per procedure,
campaign performance, etc.). Dashboards, funnels, and reporting are first-class features,
not afterthoughts.

### WhatsApp campaigns

A core capability is **dispatching WhatsApp campaigns** to leads/patients via **two
channels**:

- **Official API** — WhatsApp Cloud API / Business Platform (template messages, approved
  message templates, opt-in rules, messaging windows).
- **Unofficial API** — non-official integration (e.g. session/device-based gateways) for
  flexible sending.

When building campaign features, account for the differences between the two channels:
template approval and the 24-hour customer-service window apply to the **official** API but
not the **unofficial** one. Always model the channel explicitly in types, forms, and UI.

### Domain vocabulary

Prefer clinic/CRM domain terms in code and UI: **lead, contact, patient, pipeline,
stage/funnel, appointment, procedure, campaign, template, channel (official/unofficial),
metric/KPI**. The generic `customer` examples below are illustrative of the *patterns* —
name real entities after the domain (e.g. `useLeads`, `leadKeys`, `CampaignDto`).

---

## Stack

- **Framework**: Next.js 16 (App Router)
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS v4
- **Data Fetching**: TanStack Query v5
- **Tables**: TanStack Table v8
- **Forms**: React Hook Form v7 + Zod v4 (via `@hookform/resolvers`)
- **Language**: TypeScript (strict mode)

---

## MCP — Context7 (Library Documentation)

Before writing or modifying code that uses any of the project's libraries, **always consult Context7** to get accurate, version-specific documentation. Never rely solely on training data for library APIs — versions change and the docs may be outdated.

### When to use Context7

| Situation | Action |
|-----------|--------|
| Using a TanStack Query API (`useQuery`, `useMutation`, `useInfiniteQuery`, etc.) | Fetch docs first |
| Configuring TanStack Table (`ColumnDef`, row models, pagination, sorting) | Fetch docs first |
| Adding or configuring a shadcn/ui component | Fetch docs first |
| Using a Tailwind CSS v4 utility or config | Fetch docs first |
| Using Next.js App Router APIs (`generateMetadata`, `cookies`, Route Handlers, etc.) | Fetch docs first |
| Unsure about a hook signature, option name, or behavior | Fetch docs first |

### How to use

```
use context7 to get the docs for <library> — <topic>
```

**Examples:**

```
use context7 to get the docs for tanstack-query — useMutation options
use context7 to get the docs for tanstack-table — server-side pagination
use context7 to get the docs for shadcn/ui — DataTable with sorting
use context7 to get the docs for next.js — Route Handlers cookies
use context7 to get the docs for tailwindcss — v4 configuration
```

### Library IDs for Context7

| Library | Context7 ID |
|---------|------------|
| Next.js | `/vercel/next.js` |
| TanStack Query v5 | `/tanstack/query` |
| TanStack Table v8 | `/tanstack/table` |
| shadcn/ui | `/shadcn-ui/ui` |
| Tailwind CSS v4 | `/tailwindlabs/tailwindcss` |
| Zod | `/colinhacks/zod` |
| React Hook Form | `/react-hook-form/react-hook-form` |

### Rule

> If you are about to write an API call, hook usage, or component configuration from memory — stop and query Context7 first. A single outdated API assumption can cascade into broken behavior that's hard to debug.

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group: unauthenticated pages
│   ├── (dashboard)/              # Route group: authenticated pages
│   │   └── [feature]/
│   │       ├── page.tsx          # Server Component shell — renders <View /> only
│   │       ├── view.tsx          # Client Component ("use client") — builds the full page UI
│   │       └── _components/      # Components scoped to this route only
│   └── api/                      # Route Handlers (BFF bridge)
│       └── [resource]/
│           ├── route.ts           # GET, POST
│           └── [id]/
│               └── route.ts      # GET, PATCH, DELETE
│
├── components/
│   ├── ui/                       # shadcn primitives (DO NOT edit manually)
│   └── shared/                   # Reusable composed components
│       ├── data-table/           # TanStack Table base components
│       ├── forms/                # Reusable form building blocks
│       ├── feedback/             # Toast, Alert, Empty state, Skeleton
│       ├── layout/               # PageHeader, Section, Container, Sidebar
│       └── typography/           # Heading, Text, Label variants
│
├── hooks/
│   ├── queries/                  # TanStack Query hooks (use-*.ts)
│   └── ui/                      # UI-only hooks (use-debounce, use-disclosure)
│
├── lib/
│   ├── api/                      # fetch wrappers (api-client.ts)
│   ├── utils.ts                  # cn(), formatters, helpers
│   └── validations/              # Zod schemas shared between client and API
│
├── types/
│   ├── api.ts                    # Response/request types from backend
│   └── ui.ts                    # UI-only types (TableColumn, SelectOption…)
│
└── styles/
    └── globals.css               # Tailwind base + CSS variable theme tokens
```

---

## Routing & Pages

- Every `page.tsx` is a **Server Component** (never add `"use client"` to it) — its responsibilities are limited to: exporting `metadata`, reading server-only inputs (`params`, `searchParams`, `cookies`), optional server-side prefetch with `prefetchQuery`, and rendering the page's `<View />`.
- **Every route folder must contain a `view.tsx` file** — a Client Component (`"use client"`) that builds the page's full UI. The `page.tsx` does nothing but render it. This keeps the server/client boundary explicit and consistent across every page.
- The `view.tsx` component is named after the route in PascalCase with a `View` suffix and exported as a **named export** (e.g. `LoginView`, `CustomersView`). `page.tsx` imports it from `./view`.
- If the page prefetches data, pass server-fetched values into the view as props (or hydrate via a `HydrationBoundary`); the view itself fetches client-side through TanStack Query hooks.
- Colocate route-specific sub-components in `_components/` inside the route folder. If a component is used in 2+ routes, move it to `components/shared/`.
- Use **Route Groups** `(group)` to share layouts without affecting the URL.
- Never put business logic or UI markup directly in `page.tsx`; the view owns the UI, hooks own the logic.

```tsx
// app/(dashboard)/customers/page.tsx — Server Component shell
import { CustomersView } from "./view";

export const metadata = { title: "Customers" };

export default function CustomersPage() {
  return <CustomersView />;
}
```

```tsx
// app/(dashboard)/customers/view.tsx — Client Component that builds the full UI
"use client";

import { useCustomers } from "@/hooks/queries/use-customers";

export function CustomersView() {
  const { data, isLoading } = useCustomers(filters);
  // ...full page UI lives here
}
```

---

## Route Handlers — BFF Bridge

All HTTP calls from the client go through Next.js Route Handlers (`app/api/`). These act as a Backend-for-Frontend (BFF) layer, forwarding requests to the real backend and handling auth headers server-side.

### Rules

- **Never** call the real backend URL directly from client-side code.
- Route Handlers must forward the session token (from cookies) to the backend.
- Keep Route Handlers thin: validate input with Zod, forward to backend, return response. No business logic.
- Use consistent response shape: `{ data, error, meta }`.

```ts
// app/api/customers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api/api-client";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
  search: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const res = await apiClient.get("/customers", { params: parsed.data });
  return NextResponse.json(res.data);
}
```

```ts
// lib/api/api-client.ts — server-side fetch wrapper with auth
import { cookies } from "next/headers";

export const apiClient = {
  async get(path: string, options?: { params?: Record<string, unknown> }) {
    const token = cookies().get("session")?.value;
    const url = new URL(`${process.env.BACKEND_URL}${path}`);
    if (options?.params) {
      Object.entries(options.params).forEach(([k, v]) =>
        v !== undefined && url.searchParams.set(k, String(v))
      );
    }
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },
};
```

---

## TanStack Query — Data Fetching

All client-side data fetching must use TanStack Query. No raw `fetch` or `useEffect` for data.

### Query Hook Convention

- File: `hooks/queries/use-customers.ts`
- Export one hook per resource, accepting filters/params as arguments.
- Always define and export `queryKey` factories for cache invalidation.

```ts
// hooks/queries/use-customers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const customerKeys = {
  all: ["customers"] as const,
  list: (params: CustomersParams) => [...customerKeys.all, "list", params] as const,
  detail: (id: string) => [...customerKeys.all, "detail", id] as const,
};

export function useCustomers(params: CustomersParams) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () =>
      fetch(`/api/customers?${new URLSearchParams(params as any)}`).then(
        (r) => r.json()
      ),
    staleTime: 1000 * 60, // 1 min
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/customers/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: customerKeys.all }),
  });
}
```

### Rules

- Always handle `isLoading`, `isError`, and empty states in the component.
- Use `staleTime` deliberately — avoid refetching on every focus for stable data.
- Invalidate with the most specific key possible after mutations.
- Use `placeholderData: keepPreviousData` for paginated lists to avoid flicker.

---

## TanStack Table — All Tables

Every table in the application must be built with TanStack Table. Never use plain `<table>` HTML or a different table library.

### Base Component

Create a shared `DataTable` base in `components/shared/data-table/`:

```tsx
// components/shared/data-table/data-table.tsx
"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableSkeleton } from "./data-table-skeleton";
import { DataTableEmpty } from "./data-table-empty";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading,
  emptyMessage = "No results found.",
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <DataTableSkeleton columns={columns.length} />;

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

- Define columns in a separate `columns.tsx` file colocated with the feature.
- Server-side pagination: pass `manualPagination: true` and control state externally via URL params (`useSearchParams`).
- Sorting and filtering are controlled via URL params so they are shareable and survive refresh.

---

## Components — Composition Rules

All UI must be composed through components. No one-off inline markup in pages.

### Hierarchy

```
shadcn/ui primitives (components/ui/)
        ↓ composed into
Shared components (components/shared/)
        ↓ composed into
Feature components (app/[route]/_components/)
        ↓ assembled in
page.tsx
```

### Rules

- **Every page** must use `<PageHeader>`, `<Section>`, and layout components from `components/shared/layout/`.
- **Every form field** must go through a shared `<FormField>` wrapper that handles label, error, and description consistently.
- **Every loading state** must use a `<Skeleton>` variant — never a spinner as the only feedback.
- **Every empty state** must use the shared `<EmptyState>` component with an icon, title, and optional action.
- Never inline color values (`text-[#3b82f6]`) — only use theme tokens (see Theming section).
- Never copy-paste a component structure across two files. Extract first.

```tsx
// Good: composed through components
export function CustomersView() {
  const { data, isLoading } = useCustomers(filters);
  return (
    <Section>
      <PageHeader title="Customers" description="Manage your customer base">
        <NewCustomerButton />
      </PageHeader>
      <DataTable columns={customerColumns} data={data?.items ?? []} isLoading={isLoading} />
    </Section>
  );
}
```

---

## Theming — CSS Variables

The design must follow the project's color theme exclusively. Never hardcode color values.

All tokens are defined in `globals.css` as CSS variables and consumed via Tailwind:

```css
/* styles/globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --primary: 221 83% 53%;       /* Brand primary */
    --primary-foreground: 0 0% 100%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --border: 214 32% 91%;
    --ring: 221 83% 53%;
    /* ... extend with project-specific tokens */
  }
  .dark {
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;
    /* ... */
  }
}
```

### Rules

- Only use `bg-primary`, `text-foreground`, `border-border`, etc. — never `bg-blue-500`.
- When adding a new color to the design, add it as a CSS variable + Tailwind extension first.
- Run `npx shadcn@latest add` to add components — they inherit tokens automatically.
- Validate dark mode on every component before considering it done.

---

## TypeScript

- `strict: true` is non-negotiable.
- Never use `any`. Use `unknown` and narrow with Zod or type guards.
- API response types live in `types/api.ts`. Infer Zod schemas with `z.infer<typeof schema>` instead of duplicating types.
- Use `satisfies` operator to validate objects against types without losing inference.
- Prefer `type` over `interface` for data shapes; use `interface` for component props and extendable contracts.

---

## Forms & Client-Side Validation

**Every form and every standalone input must validate data on the client before any request is fired.** No exceptions — not even for simple single-field inputs.

### Rules

- All forms use **React Hook Form** + **Zod** resolver. Never submit without a schema.
- Every Zod schema lives in `lib/validations/` and is shared between the client form and the Route Handler — validation logic is never duplicated.
- `mode: "onBlur"` for most forms (validates on field blur); `mode: "onChange"` for long/wizard forms (validates as the user types). Never leave the default `mode: "onSubmit"` — errors should surface before the submit button is pressed.
- Reuse `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormMessage>` from shadcn/ui — never render error messages manually.
- The submit button must be `disabled` while `!form.formState.isValid || isPending`. A request must never fire from an invalid form.
- For standalone inputs outside a full form (search boxes, inline edits, filters), use `zod.safeParse()` directly and block the request if parsing fails.
- Never trust client-side validation alone — the Route Handler must also validate with the same Zod schema before forwarding to the backend.

### Installed packages & building blocks

The libraries are already installed — `react-hook-form`, `@hookform/resolvers`, and `zod`. Do not re-add them.

- The shadcn **`Form` primitives** live in `components/ui/form.tsx` (`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`). Always compose forms from these — never wire `Controller` + manual `<p>` error markup by hand. `FormControl` forwards `aria-invalid`/`aria-describedby` and `FormMessage` renders the field's Zod error automatically.
- **`Form` is `FormProvider`** — spread the form instance into it (`<Form {...form}>`) so the field context is available, then put the native `<form onSubmit={form.handleSubmit(onSubmit)} noValidate>` inside it.
- **Reference reference implementations:** `app/(auth)/login/view.tsx` and `app/(auth)/register/view.tsx`. Schemas live in `lib/validations/auth.ts`.

### Patterns & gotchas (from the auth forms)

- **Validation mode by form size:** `mode: "onBlur"` for short forms (login); `mode: "onChange"` for longer/multi-field forms with cross-field rules (register — so the confirm-password match and submit-button state stay live as the user types).
- **Cross-field validation** (e.g. password confirmation) uses `.refine()` on the object schema with `path: ["confirmPassword"]` so the error attaches to the right field.
- **Boolean "must accept" fields** (terms checkbox) use `z.boolean().refine((v) => v === true, { message })` — not `z.literal(true)` — so the custom message renders reliably under Zod v4.
- **Custom/controlled inputs** (shadcn `Checkbox`, `Select`, etc.) go inside `FormControl` and read `field.value` / call `field.onChange` explicitly. For the checkbox: `checked={field.value}` + `onCheckedChange={(c) => field.onChange(c === true)}`, and forward `onBlur`/`ref`.
- **Derived values from a field** (e.g. the password-strength meter) use **`useWatch({ control: form.control, name })`** — never `form.watch(...)` in render, which the React Compiler cannot memoize and will warn on.
- **Submit handlers** receive already-validated, typed values (`onSubmit(values: RegisterDto)`); no need to re-parse on the client before firing the request.

### Schema convention

```ts
// lib/validations/customer.ts
import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]{7,15}$/, "Enter a valid phone number.")
    .optional(),
});

export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;
```

### Form component

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCustomerSchema, type CreateCustomerDto } from "@/lib/validations/customer";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateCustomer } from "@/hooks/queries/use-customers";

export function CreateCustomerForm() {
  const form = useForm<CreateCustomerDto>({
    resolver: zodResolver(createCustomerSchema),
    mode: "onBlur",
    defaultValues: { name: "", email: "", phone: "" },
  });

  const { mutate, isPending } = useCreateCustomer();

  function onSubmit(values: CreateCustomerDto) {
    // onSubmit only fires after Zod validation passes — safe to mutate
    mutate(values, {
      onSuccess: () => {
        toast.success("Customer created.");
        form.reset();
      },
      onError: () => toast.error("Something went wrong."),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage /> {/* renders the Zod error automatically */}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Submit is disabled until the form is valid and not loading */}
        <Button type="submit" disabled={!form.formState.isValid || isPending}>
          {isPending ? "Saving…" : "Create Customer"}
        </Button>
      </form>
    </Form>
  );
}
```

### Standalone input validation (no form)

```ts
// Example: search input with debounce
const searchSchema = z.string().min(2, "Enter at least 2 characters.").max(100);

function handleSearch(value: string) {
  const result = searchSchema.safeParse(value);
  if (!result.success) {
    setSearchError(result.error.errors[0].message);
    return; // block the request
  }
  setSearchError(null);
  refetch({ search: result.data });
}
```

### Route Handler — server-side re-validation (mandatory)

The Route Handler must always re-validate with the same schema. Client-side validation is UX; server-side validation is security.

```ts
// app/api/customers/route.ts
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createCustomerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const res = await apiClient.post("/customers", parsed.data);
  return NextResponse.json(res.data, { status: 201 });
}
```

---

## Error & Loading States

Every async-driven component must handle all three states:

| State | Component to use |
|-------|-----------------|
| Loading | `<Skeleton>` matching layout shape |
| Error | `<Alert variant="destructive">` or `<ErrorBoundary>` |
| Empty | `<EmptyState icon={...} title={...} action={...} />` |

Use React Error Boundaries at the route level (`error.tsx`) to catch unexpected errors gracefully.

---

## Performance

- Prefer **Server Components** for anything that doesn't need interactivity or browser APIs.
- Use `next/image` for all images — never raw `<img>`.
- Use `next/font` for all fonts — never external font `<link>` tags.
- Dynamic imports (`next/dynamic`) for heavy client components (rich text editors, charts).
- Avoid `useEffect` for derived state — compute it inline or with `useMemo`.
- Never put large static data (lookup tables, country lists) in client bundles — fetch lazily or from a Route Handler.

---

## File & Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `CustomerTable.tsx` |
| Hooks | camelCase with `use-` prefix | `use-customers.ts` |
| Route Handlers | `route.ts` | `app/api/customers/route.ts` |
| Utilities | kebab-case | `format-date.ts` |
| Types/interfaces | PascalCase | `CustomerDto`, `TableColumn` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_UPLOAD_SIZE` |
| CSS class groups | sorted: layout → box → typography → color → state | — |

---

## Do Not

- ❌ Add `"use client"` to a `page.tsx` or build UI inside it — every page renders a `view.tsx` Client Component instead
- ❌ Call the real backend from client-side code directly — always go through `/api/`
- ❌ Use `fetch` or `axios` inside components — always use a TanStack Query hook
- ❌ Use `useEffect` to fetch data
- ❌ Use `<table>` HTML directly — use `DataTable` with TanStack Table
- ❌ Hardcode colors — use CSS variable tokens only
- ❌ Edit files in `components/ui/` manually — use `npx shadcn@latest add`
- ❌ Put more than one route's components in the same `_components/` folder
- ❌ Use `any` in TypeScript
- ❌ Skip loading/error/empty states in any data-driven component
- ❌ Create a new component for something that already exists in `components/shared/`