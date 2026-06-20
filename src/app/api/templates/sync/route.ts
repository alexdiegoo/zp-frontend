import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import { syncTemplatesSchema } from "@/lib/validations/template";
import type { SyncTemplatesResponse } from "@/types/api";

/**
 * Syncs the clinic's templates (status/content) from Meta. Forwards an optional
 * `templateId` to `POST /clinics/:clinicId/messaging/templates/sync` — omitting
 * it syncs every template — and returns the `{ syncedCount }` it answers with.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = syncTemplatesSchema.safeParse(body ?? {});

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const clinicId = await resolveClinicId();
    const data = await apiClient.post<SyncTemplatesResponse>(
      `/clinics/${clinicId}/messaging/templates/sync`,
      parsed.data,
    );
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CLINIC") {
      return NextResponse.json(
        { error: "Nenhuma clínica encontrada para a sua conta." },
        { status: 404 },
      );
    }
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: "Não foi possível sincronizar os templates." },
      { status },
    );
  }
}
