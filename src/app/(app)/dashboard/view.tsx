"use client";

import { useTranslations } from "next-intl";

import { PageHeader, Section } from "@/components/shared/layout/page-header";
import { DashboardMetricsGrid } from "@/components/dashboard/dashboard-metrics-grid";

/**
 * Dashboard home: a filterable overview of the clinic's key metrics (new leads,
 * appointments, conversion rate, revenue) for the selected period, plus a
 * placeholder for upcoming per-stage charts.
 */
export function DashboardView() {
  const t = useTranslations("dashboard");

  return (
    <Section>
      <PageHeader title={t("title")} description={t("description")} />

      <DashboardMetricsGrid />
    </Section>
  );
}
