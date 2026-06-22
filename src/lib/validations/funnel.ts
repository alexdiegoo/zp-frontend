import { z } from "zod";

import type { FunnelStage } from "@/types/api";

/**
 * Funnel schemas, shared between the board's drag-and-drop move action and
 * `PATCH /api/funnel/:entryId/move` (which forwards to the backend
 * `PATCH /clinics/:clinicId/funnel/:entryId/move`).
 */

/** Funnel stages in pipeline order. */
export const FUNNEL_STAGES = [
  "LEAD",
  "FOLLOW_UP",
  "APPOINTMENT_SCHEDULED",
  "PROCEDURE_DONE",
] as const satisfies readonly FunnelStage[];

/** Move-card body: target stage and optional position within the column. */
export const moveCardSchema = z.object({
  stage: z.enum(FUNNEL_STAGES),
  sort_order: z.coerce.number().int().min(0).optional(),
});

export type MoveCardDto = z.infer<typeof moveCardSchema>;
