import { useQuery } from "@tanstack/react-query";

import { getData } from "@/lib/api/http";
import type { Period } from "@/components/dashboard/dashboard-config";
import type { DashboardMetricsResponse } from "@/types/api";

/** Query key factory for cache management. */
export const dashboardKeys = {
  all: ["dashboard"] as const,
  metrics: (start: string, end: string) =>
    [...dashboardKeys.all, "metrics", start, end] as const,
};

/**
 * The active clinic's dashboard metrics for a period. Dashboard data is stable,
 * so it is cached for 5 minutes to avoid refetching on every focus.
 */
export function useDashboardMetrics(period: Period) {
  const start = period.start.toISOString();
  const end = period.end.toISOString();

  return useQuery({
    queryKey: dashboardKeys.metrics(start, end),
    queryFn: () =>
      getData<DashboardMetricsResponse>(
        `/api/dashboard?start_date=${encodeURIComponent(start)}&end_date=${encodeURIComponent(end)}`,
        "Não foi possível carregar as métricas do dashboard.",
      ),
    staleTime: 1000 * 60 * 5,
  });
}
