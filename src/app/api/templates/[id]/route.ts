import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import { createTemplateSchema } from "@/lib/validations/template";
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

/**
 * Updates a template and triggers a fresh AI validation. Re-validates the body
 * with the same schema as create, then forwards it to the backend
 * `PUT /clinics/:clinicId/messaging/templates/:id`, which answers `202` with a
 * `{ template }` object; we unwrap it into `{ data }`.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = createTemplateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const clinicId = await resolveClinicId();
    const { template } = await apiClient.put<{ template: TemplateDetail }>(
      `/clinics/${clinicId}/messaging/templates/${id}`,
      parsed.data,
    );
    return NextResponse.json({ data: template }, { status: 202 });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CLINIC") {
      return NextResponse.json(
        { error: "Nenhuma clínica encontrada para a sua conta." },
        { status: 404 },
      );
    }
    const status = error instanceof ApiError ? error.status : 500;
    const message =
      error instanceof ApiError && error.message
        ? error.message
        : "Não foi possível atualizar o template.";
    return NextResponse.json({ error: message }, { status });
  }
}
