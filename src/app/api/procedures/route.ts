import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import {
  procedurePayloadSchema,
  proceduresQuerySchema,
} from "@/lib/validations/procedure";
import type { ProceduresListResponse } from "@/types/api";

/**
 * Procedure listing for the active clinic. Forwards `page`/`limit`/`q` to the
 * backend `GET /clinics/:clinicId/catalog/procedures` and returns its
 * `{ data, meta }` envelope unchanged. Search (`q`) is applied server-side
 * across the whole dataset, so it works independently of the current page.
 */
export async function GET(req: NextRequest) {
  const parsed = proceduresQuerySchema.safeParse(
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
    const data = await apiClient.get<ProceduresListResponse>(
      `/clinics/${clinicId}/catalog/procedures`,
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
      { error: "Não foi possível carregar os procedimentos." },
      { status },
    );
  }
}

/** Registers a new procedure under the active clinic's catalog. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = procedurePayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const clinicId = await resolveClinicId();
    const data = await apiClient.post<{ service: unknown }>(
      `/clinics/${clinicId}/catalog/procedures`,
      parsed.data,
    );
    return NextResponse.json({ data: data.service }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CLINIC") {
      return NextResponse.json(
        { error: "Nenhuma clínica encontrada para a sua conta." },
        { status: 404 },
      );
    }
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: "Não foi possível cadastrar o procedimento." },
      { status },
    );
  }
}
