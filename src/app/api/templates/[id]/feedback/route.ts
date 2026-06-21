import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import type { TemplateAiFeedback } from "@/types/api";

/**
 * Latest AI validation feedback for a template from the backend
 * `GET /clinics/:clinicId/ai/templates/:id/feedback`, which answers with a
 * `{ feedback }` object (`null` when never validated); we unwrap it into our
 * `{ data }` envelope.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const clinicId = await resolveClinicId();
    const { feedback } = await apiClient.get<{
      feedback: TemplateAiFeedback | null;
    }>(`/clinics/${clinicId}/ai/templates/${id}/feedback`);
    return NextResponse.json({ data: feedback });
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
            ? "Feedback da IA não encontrado."
            : "Não foi possível carregar o feedback da IA.",
      },
      { status },
    );
  }
}
