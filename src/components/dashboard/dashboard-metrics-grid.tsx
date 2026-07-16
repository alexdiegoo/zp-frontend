"use client";

import { useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useDashboardMetrics } from "@/hooks/queries/use-dashboard";
import {
  DEFAULT_PERIOD_PRESET,
  getMetricCardsConfig,
  presetToPeriod,
  type Period,
} from "./dashboard-config";
import { MetricCard } from "./metric-card";
import { PeriodPicker } from "./period-picker";

/**
 * Dashboard metrics widget: a period picker over a responsive grid of metric
 * cards. Owns the selected `Period` (defaulting to the last 30 days), fetches
 * the metrics for it and maps `METRIC_CARDS_CONFIG` to cards — so a new metric
 * is one config entry, with no change here.
 */
export function DashboardMetricsGrid() {
  const t = useTranslations("dashboard");
  const [period, setPeriod] = useState<Period>(() => presetToPeriod(DEFAULT_PERIOD_PRESET));
  const { data, isLoading, isError, refetch } = useDashboardMetrics(period);
  const metricCards = useMemo(() => getMetricCardsConfig(t), [t]);

  return (
    <div className="space-y-6">
      <PeriodPicker value={period} onChange={setPeriod} />

      {isError ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{t("error.title")}</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-3">
            <span>{t("error.description")}</span>
            <Button type="button" size="sm" variant="outline" onClick={() => refetch()}>
              {t("error.retry")}
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metricCards.map((config) => (
            <MetricCard
              key={config.key}
              config={config}
              value={data?.metrics[config.key]?.value}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
