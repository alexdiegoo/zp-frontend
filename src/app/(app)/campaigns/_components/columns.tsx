"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CalendarDays,
  Check,
  Copy,
  Filter,
  MessageSquare,
  MessageSquareReply,
  MoreVertical,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import type { CampaignApiType, CampaignOverview, CampaignStatus } from "@/types/api";

const numberFormatter = new Intl.NumberFormat("pt-BR");

/** A `0..1` rate → `"23,2% taxa"`. Tiny rates keep two decimals (e.g. `0,67%`). */
function formatRate(rate: number): string {
  const pct = rate * 100;
  const decimals = pct >= 10 ? 1 : 2;
  return `${pct.toFixed(decimals).replace(".", ",")}% taxa`;
}

/** Orange = official Meta API, amber = unofficial. */
function ApiTypeBadge({ apiType }: { apiType: CampaignApiType }) {
  if (apiType === "OFFICIAL") {
    return (
      <Badge
        variant="outline"
        className="border-transparent bg-orange-500/12 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400"
      >
        API OFICIAL
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-transparent bg-amber-400/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-400"
    >
      API NÃO OFICIAL
    </Badge>
  );
}

/**
 * Status toggle. Read-only for now — it reflects the campaign status but does not
 * mutate it (pause/resume wiring is intentionally out of scope here), so the
 * `checked` value stays pinned to the prop.
 */
function StatusCell({ status }: { status: CampaignStatus }) {
  const active = status === "ACTIVE";
  return (
    <div className="flex items-center gap-2">
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

function MetricCell({
  icon: Icon,
  value,
  rate,
}: {
  icon: typeof MessageSquare;
  value: number;
  rate?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col leading-tight">
        <span className="font-medium tabular-nums text-foreground">
          {numberFormatter.format(value)}
        </span>
        {rate !== undefined ? (
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatRate(rate)}
          </span>
        ) : null}
      </div>
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
      <MetricCell icon={MessageSquare} value={row.original.metrics.totalSent} />
    ),
  },
  {
    id: "replied",
    header: "Respondido",
    cell: ({ row }) => (
      <MetricCell
        icon={MessageSquareReply}
        value={row.original.metrics.totalReplied}
        rate={row.original.metrics.repliedRate}
      />
    ),
  },
  {
    id: "scheduled",
    header: "Agendamentos",
    cell: ({ row }) => (
      <MetricCell
        icon={CalendarDays}
        value={row.original.metrics.totalScheduled}
      />
    ),
  },
  {
    id: "converted",
    header: "Conversões",
    cell: ({ row }) => (
      <MetricCell
        icon={Filter}
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
      <div className="flex justify-end">
        <RowActions campaign={row.original} />
      </div>
    ),
  },
];
