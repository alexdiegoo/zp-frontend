"use client";

import { useFormatter } from "next-intl";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Muted } from "@/components/ui/typography";
import type { MetricCardConfig, MetricFormat } from "./dashboard-config";

type MetricCardProps = {
  config: MetricCardConfig;
  value: number | undefined;
  isLoading: boolean;
};

/**
 * Single dashboard metric tile: icon + label, the formatted value, and a muted
 * description. Pure presentation — formatting is driven by `config.format`, with
 * a skeleton while loading. Holds no business logic.
 */
export function MetricCard({ config, value, isLoading }: MetricCardProps) {
  const Icon = config.icon;
  const format = useFormatter();

  // Formatting follows the active locale; currency stays BRL (data-model E4).
  function formatValue(val: number, fmt: MetricFormat): string {
    switch (fmt) {
      case "currency":
        return format.number(val, "currency");
      case "percent":
        return `${format.number(val)}%`;
      case "number":
        return format.number(val);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <Muted className="font-medium">{config.label}</Muted>
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-brand">
          <Icon className="size-4" />
        </span>
      </CardHeader>
      <CardContent className="space-y-1">
        {isLoading || value === undefined ? (
          <Skeleton className="h-9 w-28" />
        ) : (
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {formatValue(value, config.format)}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{config.description}</p>
      </CardContent>
    </Card>
  );
}
