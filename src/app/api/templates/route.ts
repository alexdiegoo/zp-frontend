import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import {
  createTemplateSchema,
  templatesQuerySchema,
} from "@/lib/validations/template";
import type { TemplateDetail, TemplatesListResponse } from "@/types/api";

/**
 * Template listing for the active clinic. Forwards `page`/`limit` to the backend
 * `GET /clinics/:clinicId/messaging/templates` and returns its `{ data, meta }`
 * envelope unchanged.
 */
export async function GET(req: NextRequest) {
  const parsed = templatesQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams),
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const clinicId = await resolveClinicId();
    const data = await apiClient.get<TemplatesListResponse>(
      `/clinics/${clinicId}/messaging/templates`,
      { params: parsed.data },
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
      { error: "Não foi possível carregar os templates." },
      { status },
    );
  }
}

/**
 * Creates a local template (draft) and starts its submission to Meta. Forwards
 * the validated body to `POST /clinics/:clinicId/messaging/templates`, which
 * answers `202` with a `{ template }` object; we unwrap it into `{ data }`.
 */
export async function POST(req: NextRequest) {
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
    const { template } = await apiClient.post<{ template: TemplateDetail }>(
      `/clinics/${clinicId}/messaging/templates`,
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
        : "Não foi possível criar o template.";
    return NextResponse.json({ error: message }, { status });
  }
}
