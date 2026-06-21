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

/* ------------------------------------------------------------------ *
 * Campaign creation (the "Nova campanha" builder)
 * ------------------------------------------------------------------ */

const campaignNameSchema = z
  .string()
  .trim()
  .min(1, "Informe o nome da campanha.")
  .max(120, "O nome deve ter no máximo 120 caracteres.");

/** Official-API campaign: sender number + approved template + selected contacts. */
export const createOfficialCampaignSchema = z.object({
  apiType: z.literal("OFFICIAL"),
  name: campaignNameSchema,
  waPhoneNumberId: z.string().trim().min(1, "Selecione um número de WhatsApp."),
  messageTemplateId: z.string().trim().min(1, "Selecione um template aprovado."),
  contactIds: z.array(z.string().min(1)).min(1, "Selecione ao menos um contato."),
});

/** Unofficial-API campaign: just the free-text message (tracking is added server-side). */
export const createUnofficialCampaignSchema = z.object({
  apiType: z.literal("UNOFFICIAL"),
  name: campaignNameSchema,
  message: z
    .string()
    .trim()
    .min(10, "A mensagem deve ter ao menos 10 caracteres.")
    .max(4096, "A mensagem deve ter no máximo 4096 caracteres."),
});

/** Discriminated union mirroring the backend `POST .../campaigns/builder` contract. */
export const createCampaignSchema = z.discriminatedUnion("apiType", [
  createOfficialCampaignSchema,
  createUnofficialCampaignSchema,
]);

export type CreateOfficialCampaignDto = z.infer<typeof createOfficialCampaignSchema>;
export type CreateUnofficialCampaignDto = z.infer<typeof createUnofficialCampaignSchema>;
export type CreateCampaignDto = z.infer<typeof createCampaignSchema>;
