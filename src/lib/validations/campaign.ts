import { z } from "zod";

/**
 * Campaigns overview query, validated in the Route Handler before forwarding to
 * the backend `GET /clinics/:clinicId/messaging/campaigns/overview`.
 *
 * Mirrors the backend contract: `search` (name ILIKE), `status`/`apiType`
 * filters, a metrics `period` window (`startDate`/`endDate` required for
 * `custom`) and pagination.
 */
export const campaignsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).optional(),
  status: z.enum(["ACTIVE", "PAUSED"]).optional(),
  apiType: z.enum(["OFFICIAL", "UNOFFICIAL"]).optional(),
  period: z.enum(["7d", "30d", "this_month", "custom"]).default("30d"),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
});

export type CampaignsQuery = z.infer<typeof campaignsQuerySchema>;

/** Pagination query for the campaign drill-down events listing. */
export const campaignEventsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CampaignEventsQuery = z.infer<typeof campaignEventsQuerySchema>;
