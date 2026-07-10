"use client";

import { PageHeader, Section } from "@/components/shared/layout/page-header";
import { DashboardMetricsGrid } from "@/components/dashboard/dashboard-metrics-grid";

/**
 * Dashboard home: a filterable overview of the clinic's key metrics (new leads,
 * appointments, conversion rate, revenue) for the selected period, plus a
 * placeholder for upcoming per-stage charts.
 */
export function DashboardView() {
  return (
    <Section>
      <PageHeader title="Dashboard" description="Visão geral da clínica" />

      <DashboardMetricsGrid />
    </Section>
  );
}
