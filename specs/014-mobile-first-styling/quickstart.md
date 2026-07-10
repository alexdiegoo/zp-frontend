# Quickstart: Verifying Mobile-First Behavior

How to run and manually verify this feature. No new tooling is required.

## Run

```bash
npm run dev        # start the app
npm test           # unit suite (RTL) — component tests for touched shared components
```

## Responsive verification harness

Use browser devtools device toolbar (Chrome: Cmd/Ctrl+Shift+M). Test at these widths:

| Width | Represents | Expected shell |
|-------|-----------|----------------|
| 320px | smallest supported phone | drawer nav, full-width content, no horizontal scroll |
| 375px | typical phone | drawer nav, full-width content |
| 768px | tablet | drawer nav (still below `lg`), full-width content |
| 1024px | small desktop | persistent sidebar + `lg:pl-[220px]` content |
| 1280px | desktop | persistent sidebar (unchanged from today) |

## Acceptance walkthrough (maps to spec success criteria)

### Shell (US1 / SC-001, SC-002, SC-005)
1. Load `/dashboard` at 375px → no horizontal page scrollbar; content spans full width.
2. Tap the hamburger in the top bar → drawer slides in from the left with the full nav.
3. Tap a destination → navigates and the drawer closes (≤2 taps to any destination).
4. Press `Esc` / tap the overlay → drawer dismisses; page scroll restored.
5. Resize to 1024px → hamburger disappears, persistent sidebar appears, content offset returns.
   Confirm the ≥1024px layout is pixel-identical to `main` (no desktop regression).

### Core views (US2 / SC-003)
6. `/patients`, `/campaigns` at 375px → tables render as stacked cards; every column's value is
   visible and labeled; the page does not scroll horizontally.
7. `/chat` at 375px → conversation list fills the screen; selecting a conversation shows the
   thread full-screen with a back control; at 1024px both panes show side by side.
8. `/funnel` at 375px → board scrolls horizontally **within its own region** (page does not);
   cards and stage controls are tappable.
9. Any form (`/campaigns/new`, `/templates/new`, `/settings`, `/login`) at 375px → fields,
   labels, and buttons stack vertically and are fully visible; primary button is full-width.

### Cross-cutting (US3 / SC-004, SC-006)
10. Sweep every page at 320 / 768 / 1024 / 1280px → no overlapping, clipped, or broken layout.
11. Toggle dark mode at each width → theme tokens hold; no color regressions.
12. On a touch device (or emulation), confirm primary controls are ≥44×44px and easily tappable.

## Pass criteria

- No page produces a full-page horizontal scrollbar at any tested width (SC-001).
- Any nav destination reachable in ≤2 taps on mobile (SC-002).
- All core workflows completable on a phone viewport with no hidden/clipped/untappable controls
  (SC-003).
- No broken layout at any breakpoint (SC-004); desktop unchanged (SC-005).
- Primary touch targets ≥44×44px (SC-006).
- Pinch-zoom remains enabled (viewport accessibility).
