"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { Check, Copy, MoreVertical } from "lucide-react";

import { ApiTypeBadge } from "@/components/shared/campaign/api-type-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CampaignOverview, CampaignStatus } from "@/types/api";

type Translator = ReturnType<typeof import("next-intl").useTranslations<"campaigns">>;

const numberFormatter = new Intl.NumberFormat("pt-BR");

/** A `0..1` rate → `"23,2% taxa"`. Tiny rates keep two decimals (e.g. `0,67%`). */
function formatRate(rate: number, t: Translator): string {
  const pct = rate * 100;
  const decimals = pct >= 10 ? 1 : 2;
  return t("columns.rate", { value: pct.toFixed(decimals).replace(".", ",") });
}

/**
 * Status toggle. Read-only for now — it reflects the campaign status but does not
 * mutate it (pause/resume wiring is intentionally out of scope here), so the
 * `checked` value stays pinned to the prop.
 */
function StatusCell({ status }: { status: CampaignStatus }) {
  const t = useTranslations("campaigns");
  const active = status === "ACTIVE";
  return (
    // Stop propagation so toggling status never triggers the row's navigation.
    <div
      className="flex w-fit items-center gap-2"
      onClick={(event) => event.stopPropagation()}
    >
      <Switch
        checked={active}
        onCheckedChange={() => {}}
        aria-readonly
        aria-label={active ? t("columns.statusActiveAria") : t("columns.statusPausedAria")}
      />
      <span
        className={cn(
          "text-sm",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {active ? t("status.active") : t("status.paused")}
      </span>
    </div>
  );
}

function MetricCell({ value, rate }: { value: number; rate?: number }) {
  const t = useTranslations("campaigns");
  return (
    <div className="flex flex-col leading-tight">
      <span className="font-medium tabular-nums text-foreground">
        {numberFormatter.format(value)}
      </span>
      {/* Always reserve the rate line so the main number stays aligned across columns. */}
      <span className="text-xs text-muted-foreground tabular-nums">
        {rate !== undefined ? formatRate(rate, t) : " "}
      </span>
    </div>
  );
}

function RowActions({ campaign }: { campaign: CampaignOverview }) {
  const t = useTranslations("campaigns");
  const [copied, setCopied] = useState(false);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(campaign.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — silently ignore.
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("columns.actionsFor", { name: campaign.name })}
        >
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("columns.actions")}</DropdownMenuLabel>
        <DropdownMenuItem onSelect={copyId}>
          {copied ? <Check /> : <Copy />}
          {copied ? t("columns.idCopied") : t("columns.copyId")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Drill-down timeline is scaffolded on the backend but not yet a screen. */}
        <DropdownMenuItem disabled>{t("columns.viewEvents")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function getCampaignColumns(
  t: Translator,
): ColumnDef<CampaignOverview, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: t("columns.name"),
      cell: ({ row }) => (
        <div className="flex flex-col gap-1.5">
          <span className="font-medium text-foreground">{row.original.name}</span>
          <ApiTypeBadge apiType={row.original.apiType} />
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t("columns.status"),
      cell: ({ row }) => <StatusCell status={row.original.status} />,
    },
    {
      id: "totalSent",
      header: t("columns.totalSent"),
      cell: ({ row }) => (
        <MetricCell value={row.original.metrics.totalSent} />
      ),
    },
    {
      id: "replied",
      header: t("columns.replied"),
      cell: ({ row }) => (
        <MetricCell
          value={row.original.metrics.totalReplied}
          rate={row.original.metrics.repliedRate}
        />
      ),
    },
    {
      id: "scheduled",
      header: t("columns.scheduled"),
      cell: ({ row }) => (
        <MetricCell value={row.original.metrics.totalScheduled} />
      ),
    },
    {
      id: "converted",
      header: t("columns.converted"),
      cell: ({ row }) => (
        <MetricCell
          value={row.original.metrics.totalConverted}
          rate={row.original.metrics.conversionRate}
        />
      ),
    },
    {
      id: "revenue",
      header: t("columns.revenue"),
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums text-brand">
          {formatCurrency(row.original.metrics.totalRevenue)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{t("columns.actions")}</span>,
      cell: ({ row }) => (
        // Stop propagation so the actions menu never triggers row navigation.
        <div
          className="flex justify-end"
          onClick={(event) => event.stopPropagation()}
        >
          <RowActions campaign={row.original} />
        </div>
      ),
    },
  ];
}
