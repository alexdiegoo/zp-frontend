"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useDashboardMetrics } from "@/hooks/queries/use-dashboard";
import {
  DEFAULT_PERIOD_PRESET,
  METRIC_CARDS_CONFIG,
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
  const [period, setPeriod] = useState<Period>(() => presetToPeriod(DEFAULT_PERIOD_PRESET));
  const { data, isLoading, isError, refetch } = useDashboardMetrics(period);

  return (
    <div className="space-y-6">
      <PeriodPicker value={period} onChange={setPeriod} />

      {isError ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Erro ao carregar métricas</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-3">
            <span>Não foi possível carregar as métricas do período selecionado.</span>
            <Button type="button" size="sm" variant="outline" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METRIC_CARDS_CONFIG.map((config) => (
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
