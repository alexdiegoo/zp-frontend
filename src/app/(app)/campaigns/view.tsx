"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Plus } from "lucide-react";

import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { PageHeader, Section } from "@/components/shared/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useCampaigns, type CampaignsParams } from "@/hooks/queries/use-campaigns";
import { useDebounce } from "@/hooks/ui/use-debounce";
import type { CampaignApiType, CampaignPeriod, CampaignStatus } from "@/types/api";
import { campaignColumns } from "./_components/columns";
import {
  CampaignFilters,
  type ApiTypeFilter,
  type StatusFilter,
} from "./_components/campaign-filters";

const PAGE_SIZE = 20;
const DEFAULT_PERIOD: CampaignPeriod = "7d";

const STATUS_VALUES: readonly CampaignStatus[] = ["ACTIVE", "PAUSED"];
const API_TYPE_VALUES: readonly CampaignApiType[] = ["OFFICIAL", "UNOFFICIAL"];
const PERIOD_VALUES: readonly CampaignPeriod[] = ["7d", "30d", "this_month"];

type ParamPatch = {
  q?: string;
  status?: StatusFilter;
  type?: ApiTypeFilter;
  period?: CampaignPeriod;
  page?: number;
};

export function CampaignsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL is the source of truth — shareable + survives refresh.
  const pageParam = Number(searchParams.get("page"));
  const page = Number.isFinite(pageParam) && pageParam >= 1 ? pageParam : 1;
  const activeSearch = searchParams.get("q") ?? "";

  const statusParam = searchParams.get("status") as CampaignStatus | null;
  const status: StatusFilter =
    statusParam && STATUS_VALUES.includes(statusParam) ? statusParam : "all";

  const apiTypeParam = searchParams.get("type") as CampaignApiType | null;
  const apiType: ApiTypeFilter =
    apiTypeParam && API_TYPE_VALUES.includes(apiTypeParam) ? apiTypeParam : "all";

  const periodParam = searchParams.get("period") as CampaignPeriod | null;
  const period: CampaignPeriod =
    periodParam && PERIOD_VALUES.includes(periodParam)
      ? periodParam
      : DEFAULT_PERIOD;

  // Local input state for responsive typing; debounced before syncing to URL.
  const [searchInput, setSearchInput] = useState(activeSearch);
  const debouncedSearch = useDebounce(searchInput, 400);
  const trimmedSearch = debouncedSearch.trim();
  const searchError = trimmedSearch.length === 1 ? "Digite ao menos 2 caracteres." : null;

  const replaceParams = useCallback(
    (next: ParamPatch) => {
      const params = new URLSearchParams(searchParams);
      const setOrDelete = (key: string, value: string) => {
        if (value) params.set(key, value);
        else params.delete(key);
      };

      if (next.q !== undefined) setOrDelete("q", next.q);
      if (next.status !== undefined)
        setOrDelete("status", next.status === "all" ? "" : next.status);
      if (next.type !== undefined)
        setOrDelete("type", next.type === "all" ? "" : next.type);
      if (next.period !== undefined)
        setOrDelete("period", next.period === DEFAULT_PERIOD ? "" : next.period);
      if (next.page !== undefined) {
        if (next.page > 1) params.set("page", String(next.page));
        else params.delete("page");
      }

      router.replace(`${pathname}?${params}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Sync the debounced search term to the URL (resetting to page 1).
  useEffect(() => {
    if (trimmedSearch.length === 1) return; // Block 1-char queries.
    if (trimmedSearch === activeSearch) return; // Skip if unchanged.
    replaceParams({ q: trimmedSearch, page: 1 });
  }, [trimmedSearch, activeSearch, replaceParams]);

  const params = useMemo<CampaignsParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      period,
      search: activeSearch || undefined,
      status: status === "all" ? undefined : status,
      apiType: apiType === "all" ? undefined : apiType,
    }),
    [page, period, activeSearch, status, apiType],
  );

  const { data, isLoading, isError, error, isFetching, refetch } =
    useCampaigns(params);

  const rows = data?.data ?? [];
  const meta = data?.meta;

  const hasActiveFilters =
    Boolean(activeSearch) || status !== "all" || apiType !== "all";
  const emptyMessage = hasActiveFilters
    ? "Nenhuma campanha encontrada com os filtros atuais."
    : "Nenhuma campanha cadastrada ainda.";

  return (
    <Section>
      <PageHeader
        title="Campanhas"
        description="Gerencie e acompanhe o desempenho de suas campanhas de WhatsApp."
      >
        {/* Campaign creation flow is out of scope for this listing. */}
        <Button>
          <Plus />
          Nova campanha
        </Button>
      </PageHeader>

      <CampaignFilters
        search={searchInput}
        onSearchChange={setSearchInput}
        searchError={searchError}
        status={status}
        onStatusChange={(value) => replaceParams({ status: value, page: 1 })}
        apiType={apiType}
        onApiTypeChange={(value) => replaceParams({ type: value, page: 1 })}
        period={period}
        onPeriodChange={(value) => replaceParams({ period: value, page: 1 })}
      />

      {isError ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Não foi possível carregar as campanhas.</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Tente novamente em instantes."}
            <button
              type="button"
              onClick={() => refetch()}
              className="font-medium underline underline-offset-4"
            >
              Tentar novamente
            </button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-col gap-4">
          <DataTable
            columns={campaignColumns}
            data={rows}
            isLoading={isLoading}
            emptyMessage={emptyMessage}
          />
          {meta && meta.total > 0 ? (
            <DataTablePagination
              page={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              pageCount={rows.length}
              limit={meta.limit}
              isFetching={isFetching}
              onPageChange={(next) => replaceParams({ page: next })}
              noun={{ singular: "campanha", plural: "campanhas" }}
            />
          ) : null}
        </div>
      )}
    </Section>
  );
}
