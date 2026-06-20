import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import {
  appointmentsQuerySchema,
  createAppointmentSchema,
} from "@/lib/validations/appointment";
import type { AppointmentsListResponse } from "@/types/api";

const NO_CLINIC = "Nenhuma clínica encontrada para a sua conta.";

/**
 * Calendar listing for the active clinic. Forwards the `startAt`/`endAt` window
 * to the backend `GET /clinics/:clinicId/scheduling/appointments`, which answers
 * with a bare `AppointmentResponseDto[]`. We wrap it in the `{ data }` envelope
 * the client `getData` helper expects.
 */
export async function GET(req: NextRequest) {
  const parsed = appointmentsQuerySchema.safeParse(
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
    const data = await apiClient.get<AppointmentsListResponse>(
      `/clinics/${clinicId}/scheduling/appointments`,
      { params: parsed.data },
    );
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CLINIC") {
      return NextResponse.json({ error: NO_CLINIC }, { status: 404 });
    }
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: "Não foi possível carregar a agenda." },
      { status },
    );
  }
}

/** Creates an appointment under the active clinic's scheduling module. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = createAppointmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const clinicId = await resolveClinicId();
    const data = await apiClient.post(
      `/clinics/${clinicId}/scheduling/appointments`,
      parsed.data,
    );
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CLINIC") {
      return NextResponse.json({ error: NO_CLINIC }, { status: 404 });
    }
    const status = error instanceof ApiError ? error.status : 500;
    const message =
      error instanceof ApiError
        ? error.message
        : "Não foi possível criar o agendamento.";
    return NextResponse.json({ error: message }, { status });
  }
}
