"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("campaigns");
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
              placeholder={t("filters.searchPlaceholder")}
              aria-label={t("filters.searchAria")}
              aria-invalid={Boolean(searchError)}
              className={cn("px-8", searchError && "border-destructive")}
            />
            {search ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label={t("clearSearch")}
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
            <SelectTrigger aria-label={t("filters.statusAria")} className="min-w-32">
              <SelectValue placeholder={t("filters.statusPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.all")}</SelectItem>
              <SelectItem value="ACTIVE">{t("status.active")}</SelectItem>
              <SelectItem value="PAUSED">{t("status.paused")}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={apiType}
            onValueChange={(value) => onApiTypeChange(value as ApiTypeFilter)}
          >
            <SelectTrigger aria-label={t("filters.typeAria")} className="min-w-36">
              <SelectValue placeholder={t("filters.typePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.all")}</SelectItem>
              <SelectItem value="OFFICIAL">{t("channel.official")}</SelectItem>
              <SelectItem value="UNOFFICIAL">{t("channel.unofficial")}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={period}
            onValueChange={(value) => onPeriodChange(value as CampaignPeriod)}
          >
            <SelectTrigger aria-label={t("filters.periodAria")} className="min-w-40">
              <SelectValue placeholder={t("filters.periodPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">{t("filters.periodLast30")}</SelectItem>
              <SelectItem value="7d">{t("filters.periodLast7")}</SelectItem>
              <SelectItem value="this_month">{t("filters.periodThisMonth")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
