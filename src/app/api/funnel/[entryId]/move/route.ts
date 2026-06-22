import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import { moveCardSchema } from "@/lib/validations/funnel";
import type { FunnelCard } from "@/types/api";

const NO_CLINIC = "Nenhuma clínica encontrada para a sua conta.";

/**
 * Moves a funnel card to a new stage/position. Re-validates the body and
 * forwards it to the backend `PATCH /clinics/:clinicId/funnel/:entryId/move`,
 * returning the updated card.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ entryId: string }> },
) {
  const { entryId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = moveCardSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const clinicId = await resolveClinicId();
    const data = await apiClient.patch<FunnelCard>(
      `/clinics/${clinicId}/funnel/${entryId}/move`,
      parsed.data,
    );
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CLINIC") {
      return NextResponse.json({ error: NO_CLINIC }, { status: 404 });
    }
    const status = error instanceof ApiError ? error.status : 500;
    const message =
      error instanceof ApiError
        ? error.message
        : "Não foi possível mover o cartão.";
    return NextResponse.json({ error: message }, { status });
  }
}
