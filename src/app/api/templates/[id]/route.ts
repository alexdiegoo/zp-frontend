import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import type { TemplateDetail } from "@/types/api";

/**
 * Full template detail from the backend
 * `GET /clinics/:clinicId/messaging/templates/:id`, which answers with a
 * `{ template }` object; we unwrap it into our `{ data }` envelope.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const clinicId = await resolveClinicId();
    const { template } = await apiClient.get<{ template: TemplateDetail }>(
      `/clinics/${clinicId}/messaging/templates/${id}`,
    );
    return NextResponse.json({ data: template });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CLINIC") {
      return NextResponse.json(
        { error: "Nenhuma clínica encontrada para a sua conta." },
        { status: 404 },
      );
    }
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      {
        error:
          status === 404
            ? "Template não encontrado."
            : "Não foi possível carregar o template.",
      },
      { status },
    );
  }
}
