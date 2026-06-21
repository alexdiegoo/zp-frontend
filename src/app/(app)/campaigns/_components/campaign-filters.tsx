"use client";

import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  CampaignApiType,
  CampaignPeriod,
  CampaignStatus,
} from "@/types/api";

export type StatusFilter = "all" | CampaignStatus;
export type ApiTypeFilter = "all" | CampaignApiType;

interface CampaignFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchError?: string | null;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  apiType: ApiTypeFilter;
  onApiTypeChange: (value: ApiTypeFilter) => void;
  period: CampaignPeriod;
  onPeriodChange: (value: CampaignPeriod) => void;
}

/**
 * Campaign listing filters: name search, status, API type and metrics period.
 * State is owned by the parent (synced to the URL); this component is presentational.
 */
export function CampaignFilters({
  search,
  onSearchChange,
  searchError,
  status,
  onStatusChange,
  apiType,
  onApiTypeChange,
  period,
  onPeriodChange,
}: CampaignFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full lg:max-w-xs">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar campanhas…"
              aria-label="Buscar campanhas"
              aria-invalid={Boolean(searchError)}
              className={cn("px-8", searchError && "border-destructive")}
            />
            {search ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Limpar busca"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
          {searchError ? (
            <p className="mt-1 text-[13px] text-destructive">{searchError}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={status}
            onValueChange={(value) => onStatusChange(value as StatusFilter)}
          >
            <SelectTrigger aria-label="Filtrar por status" className="min-w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ACTIVE">Ativo</SelectItem>
              <SelectItem value="PAUSED">Pausado</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={apiType}
            onValueChange={(value) => onApiTypeChange(value as ApiTypeFilter)}
          >
            <SelectTrigger aria-label="Filtrar por tipo" className="min-w-36">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="OFFICIAL">API Oficial</SelectItem>
              <SelectItem value="UNOFFICIAL">API Não Oficial</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={period}
            onValueChange={(value) => onPeriodChange(value as CampaignPeriod)}
          >
            <SelectTrigger aria-label="Filtrar por período" className="min-w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="this_month">Este mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
