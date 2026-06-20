/**
 * Design tokens extracted from `design/list-campaigns.html`.
 *
 * These mirror the CSS variables defined in `src/app/globals.css`. Prefer the
 * Tailwind token utilities (`bg-primary`, `text-brand`, `border-border`, …) in
 * components; this object exists for documentation, charts, and the
 * `/design-system` showcase where raw values are needed.
 */
export const tokens = {
  colors: {
    background: "#f9fafb",
    foreground: "#151e16",
    card: "#ffffff",
    /** WhatsApp green — primary call-to-action color. */
    primary: "#25d366",
    primaryForeground: "#ffffff",
    /** Deep brand green — logo & key figures. */
    brand: "#006d2f",
    brandForeground: "#ffffff",
    secondary: "#e7f1e4",
    muted: "#edf6e9",
    mutedForeground: "#3c4a3d",
    accent: "#e7f1e4",
    border: "#d7e0d3",
    input: "#cfdbcb",
    ring: "#25d366",
    destructive: "#ba1a1a",
    sidebar: "#1a1a2e",
    sidebarPrimary: "#25d366",
  },
  /** Channel chip colors (kept literal — semantic status, not brand ramp). */
  channels: {
    official: { bg: "#dbeafe", fg: "#1d4ed8" }, // blue-100 / blue-700
    unofficial: { bg: "#fef3c7", fg: "#b45309" }, // amber-100 / amber-700
  },
  borderRadius: "0.5rem",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
} as const;

export type Tokens = typeof tokens;
