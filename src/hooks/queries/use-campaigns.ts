import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getData } from "@/lib/api/http";
import type {
  CampaignApiType,
  CampaignEventsResponse,
  CampaignPeriod,
  CampaignsListResponse,
  CampaignStatus,
} from "@/types/api";

export type CampaignsParams = {
  page: number;
  limit: number;
  search?: string;
  status?: CampaignStatus;
  apiType?: CampaignApiType;
  period: CampaignPeriod;
  startDate?: string;
  endDate?: string;
};

/** Query key factory for cache management. */
export const campaignKeys = {
  all: ["campaigns"] as const,
  list: (params: CampaignsParams) =>
    [...campaignKeys.all, "list", params] as const,
  events: (id: string, page: number) =>
    [...campaignKeys.all, "events", id, page] as const,
};

/** Builds the BFF query string, omitting empty/default-less optional params. */
function buildSearch(params: CampaignsParams): URLSearchParams {
  const search = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    period: params.period,
  });
  if (params.search) search.set("search", params.search);
  if (params.status) search.set("status", params.status);
  if (params.apiType) search.set("apiType", params.apiType);
  if (params.period === "custom") {
    if (params.startDate) search.set("startDate", params.startDate);
    if (params.endDate) search.set("endDate", params.endDate);
  }
  return search;
}

/** Paginated campaigns overview with search/status/apiType/period filters. */
export function useCampaigns(params: CampaignsParams, enabled = true) {
  return useQuery({
    queryKey: campaignKeys.list(params),
    queryFn: () =>
      getData<CampaignsListResponse>(`/api/campaigns?${buildSearch(params)}`),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  });
}

/** Drill-down event timeline for a single campaign (currently always empty). */
export function useCampaignEvents(id: string, page = 1, enabled = true) {
  return useQuery({
    queryKey: campaignKeys.events(id, page),
    queryFn: () =>
      getData<CampaignEventsResponse>(
        `/api/campaigns/${id}/events?page=${page}`,
      ),
    enabled: enabled && Boolean(id),
    staleTime: 1000 * 30,
  });
}
