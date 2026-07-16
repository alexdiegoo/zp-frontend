import {
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { DashboardMetrics } from "@/types/api";

/** The `dashboard` namespace translator. */
type Translator = ReturnType<typeof import("next-intl").useTranslations<"dashboard">>;

/** Quick-range presets plus a manual custom range. */
export type PeriodPreset = "7d" | "30d" | "90d" | "custom";

/** A resolved date range the dashboard queries against. */
export type Period = {
  start: Date;
  end: Date;
};

/** How a metric's numeric value is rendered. */
export type MetricFormat = "number" | "currency" | "percent";

/**
 * Declarative config for one metric card. Adding a metric is a single new entry
 * here (plus the backend read) — no card markup changes. The icon is the
 * `lucide-react` component itself (type-safe, no string lookup).
 */
export type MetricCardConfig = {
  key: keyof DashboardMetrics;
  label: string;
  format: MetricFormat;
  icon: LucideIcon;
  description: string;
};

/**
 * The dashboard's metric cards, in display order. A factory so the localized
 * labels/descriptions are resolved from the `dashboard` namespace translator.
 * Adding a metric is still a single new entry here (plus its message keys).
 */
export function getMetricCardsConfig(t: Translator): MetricCardConfig[] {
  return [
    {
      key: "new_leads",
      label: t("metrics.newLeads.label"),
      format: "number",
      icon: Users,
      description: t("metrics.newLeads.description"),
    },
    {
      key: "appointments",
      label: t("metrics.appointments.label"),
      format: "number",
      icon: CalendarCheck,
      description: t("metrics.appointments.description"),
    },
    {
      key: "conversion_rate",
      label: t("metrics.conversionRate.label"),
      format: "percent",
      icon: TrendingUp,
      description: t("metrics.conversionRate.description"),
    },
    {
      key: "revenue",
      label: t("metrics.revenue.label"),
      format: "currency",
      icon: DollarSign,
      description: t("metrics.revenue.description"),
    },
  ];
}

const PRESET_DAYS: Record<Exclude<PeriodPreset, "custom">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

/** Default range shown on first load. */
export const DEFAULT_PERIOD_PRESET: Exclude<PeriodPreset, "custom"> = "30d";

/**
 * Resolves a preset to a concrete range ending now and starting `n` days back at
 * the start of that day, so the window is inclusive of the full first day.
 * @param preset - A quick-range preset (never `"custom"`).
 * @returns The resolved `{ start, end }` range.
 */
export function presetToPeriod(preset: Exclude<PeriodPreset, "custom">): Period {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - PRESET_DAYS[preset]);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}
