"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
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

const numberFormatter = new Intl.NumberFormat("pt-BR");

/** A `0..1` rate → `"23,2% taxa"`. Tiny rates keep two decimals (e.g. `0,67%`). */
function formatRate(rate: number): string {
  const pct = rate * 100;
  const decimals = pct >= 10 ? 1 : 2;
  return `${pct.toFixed(decimals).replace(".", ",")}% taxa`;
}

/**
 * Status toggle. Read-only for now — it reflects the campaign status but does not
 * mutate it (pause/resume wiring is intentionally out of scope here), so the
 * `checked` value stays pinned to the prop.
 */
function StatusCell({ status }: { status: CampaignStatus }) {
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
        aria-label={active ? "Campanha ativa" : "Campanha pausada"}
      />
      <span
        className={cn(
          "text-sm",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {active ? "Ativo" : "Pausado"}
      </span>
    </div>
  );
}

function MetricCell({ value, rate }: { value: number; rate?: number }) {
  return (
    <div className="flex flex-col leading-tight">
      <span className="font-medium tabular-nums text-foreground">
        {numberFormatter.format(value)}
      </span>
      {/* Always reserve the rate line so the main number stays aligned across columns. */}
      <span className="text-xs text-muted-foreground tabular-nums">
        {rate !== undefined ? formatRate(rate) : " "}
      </span>
    </div>
  );
}

function RowActions({ campaign }: { campaign: CampaignOverview }) {
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
          aria-label={`Ações para ${campaign.name}`}
        >
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuItem onSelect={copyId}>
          {copied ? <Check /> : <Copy />}
          {copied ? "ID copiado" : "Copiar ID"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Drill-down timeline is scaffolded on the backend but not yet a screen. */}
        <DropdownMenuItem disabled>Ver eventos (em breve)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const campaignColumns: ColumnDef<CampaignOverview, unknown>[] = [
  {
    accessorKey: "name",
    header: "Campanha",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1.5">
        <span className="font-medium text-foreground">{row.original.name}</span>
        <ApiTypeBadge apiType={row.original.apiType} />
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusCell status={row.original.status} />,
  },
  {
    id: "totalSent",
    header: "Total Enviado",
    cell: ({ row }) => (
      <MetricCell value={row.original.metrics.totalSent} />
    ),
  },
  {
    id: "replied",
    header: "Respondido",
    cell: ({ row }) => (
      <MetricCell
        value={row.original.metrics.totalReplied}
        rate={row.original.metrics.repliedRate}
      />
    ),
  },
  {
    id: "scheduled",
    header: "Agendamentos",
    cell: ({ row }) => (
      <MetricCell value={row.original.metrics.totalScheduled} />
    ),
  },
  {
    id: "converted",
    header: "Conversões",
    cell: ({ row }) => (
      <MetricCell
        value={row.original.metrics.totalConverted}
        rate={row.original.metrics.conversionRate}
      />
    ),
  },
  {
    id: "revenue",
    header: "Receita",
    cell: ({ row }) => (
      <span className="font-semibold tabular-nums text-brand">
        {formatCurrency(row.original.metrics.totalRevenue)}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Ações</span>,
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
