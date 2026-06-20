# ZapBlast — Design Tokens

Extracted from `design/list-campaigns.html` (the canonical visual reference). This file maps
the reference's raw values to the project's shadcn/ui + Tailwind v4 token system defined in
`src/app/globals.css` and mirrored in `src/lib/tokens.ts`.

---

## 1. Visual tone

- **Light theme**, high density, clean SaaS table UI.
- Dark navy **sidebar** contrasted with a near-white **content canvas**.
- WhatsApp-green accent (`#25D366`) drives every primary action; a deeper brand green
  (`#006D2F`) carries identity (logo) and key figures (revenue).
- **Tight rounding** — reference `borderRadius` tops out at `0.5rem`; we standardize on
  `--radius: 0.5rem`.
- Borders are thin, low-contrast green-grays. Inputs are white with a soft border and a
  green focus ring.

## 2. Color palette

| Role | Reference value | Where used | shadcn token |
|------|-----------------|-----------|--------------|
| App canvas | `#F9FAFB` | `main` content background | `--background` |
| Foreground text | `#151E16` (`on-surface`) | body text | `--foreground` |
| Card / surface | `#FFFFFF` | tables, inputs, header | `--card`, `--popover` |
| Brand green (deep) | `#006D2F` (`primary`) | logo box, revenue figures | `--brand` |
| WhatsApp green | `#25D366` (`primary-container`) | CTA buttons, active nav, toggles, focus ring | `--primary`, `--ring` |
| Muted text | `#3C4A3D` (`on-surface-variant`) | descriptions, labels | `--muted-foreground` |
| Muted surface | `#EDF6E9` (`surface-container-low`) | table header row | `--muted` |
| Accent surface | `#E7F1E4` (`surface-container`) | hover / ghost backgrounds | `--accent`, `--secondary` |
| Border | `#BBCBB9` (`outline-variant`) → softened to `#D7E0D3` | table/input/header borders | `--border`, `--input` |
| Error | `#BA1A1A` (`error`) | destructive, notification dot | `--destructive` |
| Sidebar bg | `#1A1A2E` (`sidebar-bg`) | left sidebar | `--sidebar` |
| Sidebar active | `#25D366` | active nav item | `--sidebar-primary` |

### Status / badge colors (table)
- Active dot: `#25D366`; Paused dot: `slate-400`.
- "API Oficial" badge: `bg-blue-100 / text-blue-700`.
- "API Não Oficial" badge: `bg-amber-100 / text-amber-700`.

These channel badges keep their literal Tailwind palette colors (blue/amber) since they are
semantic status chips, not part of the brand ramp.

## 3. Typography

- **Family**: `Inter` (Google Fonts), weights 300–900. Loaded via `next/font`.
- Scale extracted from the reference `fontSize` config:

| Token | Size / line-height / weight | Component |
|-------|------------------------------|-----------|
| `headline-lg` | 24px / 32px / 600, -0.02em | `<H1>` |
| `headline-md` | 20px / 28px / 600, -0.01em | `<H2>` |
| `headline-sm` | 16px / 24px / 600 | `<H3>` |
| `body-lg` | 16px / 24px / 400 | — |
| `body-md` | 14px / 20px / 400 | `<P>` |
| `body-sm` | 13px / 18px / 400 | `<Muted>` |
| `label-md` | 12px / 16px / 500, +0.05em, uppercase | `<Label>` |
| `label-sm` | 11px / 14px / 600 | small captions |
| `table-data` | 13px / 16px / 400 | table cells |

## 4. Spacing

Reference uses a 4px base unit: `xs 4 · sm 8 · md 16 (gutter) · lg 24 · xl 32`, page margin `24px`.
We map these to Tailwind's default 4px scale (`gap-2`, `p-4`, `px-6`, …) — no custom spacing
scale needed.

## 5. Sidebar

- Width **220px**, fixed left, full height.
- Background `#1A1A2E`, default text `white/70`, hover `white` on `white/5`.
- Logo: deep-green (`--brand`) rounded square with a `bolt` (Lucide `Zap`) glyph + "ZapBlast".
- Navigation grouped under collapsible uppercase headers ("Atendimento", "Disparos WhatsApp").
- **Active item**: solid `#25D366` background, white text.
- Footer: "Configurações" link + a `--brand`-tinted "Pro plan / UPGRADE" card.

## 6. Component patterns

- **Buttons**: `rounded-lg` (~0.5rem), filled primary = WhatsApp green + white text,
  hover lowers opacity; icon + label with `gap`. Outline = white bg + soft border. Ghost for
  in-app/sidebar actions.
- **Inputs / selects**: white bg, soft border, `rounded-lg`, green focus ring
  (`focus-visible:ring-ring`), muted placeholder, ~32–40px height.
- **Badges/chips**: tiny (10–11px), bold, uppercase, tight tracking.
- **Icons**: reference uses Material Symbols; project standard is **Lucide React**
  (mapped 1:1, e.g. `bolt→Zap`, `campaign→Megaphone`, `chat→MessageCircle`,
  `filter_alt→Filter`, `person→Users`, `calendar_today→Calendar`, `settings→Settings`).
