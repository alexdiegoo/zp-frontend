import type { FunnelStage } from "@/types/api";

import { FUNNEL_STAGES } from "@/lib/validations/funnel";

type Translator = ReturnType<typeof import("next-intl").useTranslations<"funnel">>;

/** Human labels for each stage, in pipeline order. IDs stay stable; only labels are translated. */
export function getFunnelStageLabels(t: Translator): Record<FunnelStage, string> {
  return {
    LEAD: t("stages.lead"),
    FOLLOW_UP: t("stages.followUp"),
    APPOINTMENT_SCHEDULED: t("stages.appointmentScheduled"),
    PROCEDURE_DONE: t("stages.procedureDone"),
  };
}

/** Stages rendered left-to-right on the board. */
export const FUNNEL_STAGE_ORDER: readonly FunnelStage[] = FUNNEL_STAGES;

/** Accent classes for each column header, keyed by stage. */
export const FUNNEL_STAGE_COLORS: Record<FunnelStage, string> = {
  LEAD: "border-slate-400 bg-slate-50",
  FOLLOW_UP: "border-blue-400 bg-blue-50",
  APPOINTMENT_SCHEDULED: "border-amber-400 bg-amber-50",
  PROCEDURE_DONE: "border-green-400 bg-green-50",
};
