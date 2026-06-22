import {
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { DashboardMetrics } from "@/types/api";

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

/** The dashboard's metric cards, in display order. */
export const METRIC_CARDS_CONFIG: MetricCardConfig[] = [
  {
    key: "new_leads",
    label: "Novos Leads",
    format: "number",
    icon: Users,
    description: "Pacientes que entraram no funil no período",
  },
  {
    key: "appointments",
    label: "Agendamentos",
    format: "number",
    icon: CalendarCheck,
    description: "Consultas agendadas no período",
  },
  {
    key: "conversion_rate",
    label: "Taxa de Conversão",
    format: "percent",
    icon: TrendingUp,
    description: "Leads que realizaram procedimento",
  },
  {
    key: "revenue",
    label: "Receita",
    format: "currency",
    icon: DollarSign,
    description: "Soma dos procedimentos concluídos no período",
  },
];

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
