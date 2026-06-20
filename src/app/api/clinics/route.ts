import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { createClinicSchema } from "@/lib/validations/clinic";
import type {
  ClinicsBackendResponse,
  CreateClinicBackendResponse,
} from "@/types/api";

/** Clinics owned by the authenticated user — drives the clinic switcher. */
export async function GET() {
  try {
    const { companies } = await apiClient.get<ClinicsBackendResponse>(
      "/clinics",
    );
    return NextResponse.json({ data: companies });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: "Não foi possível carregar suas clínicas." },
      { status },
    );
  }
}

/** Creates a clinic for the authenticated user. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = createClinicSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const { company } = await apiClient.post<CreateClinicBackendResponse>(
      "/clinics",
      parsed.data,
    );
    return NextResponse.json({ data: company }, { status: 201 });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: "Não foi possível criar a clínica. Tente novamente." },
      { status },
    );
  }
}
