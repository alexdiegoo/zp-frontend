# Phase 0 Research: Mobile-First Styling Refactor

All library APIs below were verified via Context7 (Constitution Principle IX) on 2026-07-10.

## R1. Tailwind v4 breakpoints & the mobile-first model

- **Decision**: Use Tailwind's default breakpoints unmodified — `sm` 640px, `md` 768px, `lg`
  1024px, `xl` 1280px. Unprefixed utilities are the mobile base; add `lg:` (and occasionally
  `md:`/`sm:`) prefixes to layer on larger-screen layout. The shell's mobile↔desktop switch is
  `lg` (1024px), matching the clarified decision.
- **Rationale**: Tailwind is mobile-first by design — an unprefixed utility applies at all widths
  and a prefixed one applies at that breakpoint **and up**. The repo's `globals.css` uses
  `@theme` with no `--breakpoint-*` overrides, so defaults are in effect and `lg` = 1024px
  already. No config change needed.
- **Alternatives considered**: Custom breakpoint tokens (rejected — adds a maintenance surface
  with no benefit; 1024px is exactly Tailwind's `lg`). A `md` (768px) sidebar cutoff (rejected in
  clarification — 220px sidebar + content is cramped on tablets).

## R2. Mobile navigation: Sheet drawer

- **Decision**: Add the shadcn `Sheet` primitive (`npx shadcn@latest add sheet`) and use a
  `Sheet` with `side="left"` as the mobile navigation drawer. The desktop `<aside>` sidebar is
  hidden below `lg` (`hidden lg:flex`); a hamburger trigger in the top bar is shown only below
  `lg` (`lg:hidden`) and opens the Sheet. Both the sidebar and the Sheet render the **same**
  extracted `SidebarNav` body.
- **Rationale**: This is exactly the pattern shadcn's own Sidebar uses — a fixed sidebar on
  desktop that becomes a `Sheet` overlay on mobile. `Sheet` (Radix Dialog under the hood) gives
  focus trapping, scroll locking, `Esc`/overlay dismissal, and accessible labelling for free,
  satisfying the drawer edge cases in the spec. `Sheet` is not currently in `components/ui/`
  (only `dialog.tsx` and `alert-dialog.tsx` exist), so it must be added via the CLI (never
  hand-authored — Principle VI).
- **Alternatives considered**: `Drawer` (vaul) — reserved for bottom-sheet mobile dialogs, not
  side navigation. Hand-rolled off-canvas div — rejected (reimplements focus/scroll/a11y that
  Sheet already provides). shadcn's full `Sidebar` block — heavier than needed; the app already
  has a bespoke sidebar we only need to make responsive.

## R3. CSS-driven visibility vs JS media query (hydration)

- **Decision**: Drive shell visibility purely with CSS breakpoint utilities (`hidden lg:flex` /
  `lg:hidden`). Render both the desktop sidebar and the mobile trigger in the DOM; let CSS decide
  which is visible. Introduce a `use-media-query` hook **only** where a component must branch its
  behavior in JS (e.g. chat: which single pane to show on mobile).
- **Rationale**: A JS media query returns a fixed value during SSR/first paint, causing a
  hydration flash or mismatch (the sidebar briefly renders wrong). Pure CSS toggling has no such
  flash and needs no JS (Principle X). Reserve JS media queries for genuine behavioral branches,
  not layout visibility.
- **Alternatives considered**: `useMediaQuery` for everything (rejected — hydration flash, extra
  client JS for what CSS does natively).

## R4. Viewport meta tag

- **Decision**: Rely on Next.js's built-in default viewport (`width=device-width,
  initial-scale=1`), which the App Router injects automatically. Add an explicit
  `export const viewport: Viewport = { ... }` in `app/layout.tsx` only if a `themeColor` or
  `interactiveWidget` setting is wanted. **Do not** set `maximumScale`/`userScalable: false` —
  pinch-zoom must remain enabled for accessibility.
- **Rationale**: Context7 confirms Next.js includes a sensible viewport meta by default, so
  mobile browsers already lay out at device width (the desktop-first symptoms are from the CSS,
  not a missing meta tag). Disabling user scaling is a common but WCAG-failing anti-pattern.
- **Alternatives considered**: Explicit `viewport` export with `maximumScale: 1` (rejected —
  breaks zoom, fails WCAG 1.4.4 / 1.4.10).

## R5. Data tables on small screens

- **Decision**: Extend the shared `DataTable` base so that below `md` it renders each row as a
  labeled card (stacked field-label + value pairs) driven by the same TanStack Table row model,
  and at `md`+ it renders the standard `<Table>`. A contained `overflow-x-auto` region is used
  only as a fallback for tables explicitly flagged as too wide for cards.
- **Rationale**: Keeps one table primitive and one column definition (Principle IV) while giving
  a readable mobile layout with no full-page horizontal scroll and no lost data (FR-005/FR-006,
  clarified default = cards). Rendering from `row.getVisibleCells()` reuses the existing
  `flexRender` cell definitions, so column config is not duplicated.
- **Alternatives considered**: A separate mobile list component per feature (rejected —
  duplication, drifts from column defs). Horizontal scroll for all tables (rejected in
  clarification — poorer readability; kept only as a wide-table fallback).

## Summary of decisions

| Ref | Decision |
|-----|----------|
| R1 | Default Tailwind breakpoints; mobile-first base + `lg` (1024px) shell switch |
| R2 | Add `Sheet`; left-side drawer reusing shared `SidebarNav`; hamburger in top bar |
| R3 | CSS-driven visibility (`hidden lg:flex` / `lg:hidden`); JS media query only for behavior branches |
| R4 | Use Next default viewport; keep user scaling enabled (a11y) |
| R5 | Responsive `DataTable`: cards below `md`, table at `md`+, contained scroll as wide-table fallback |

No NEEDS CLARIFICATION items remain.
