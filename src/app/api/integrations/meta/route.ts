import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";

/**
 * Starts the Meta (Facebook) OAuth flow to connect the official WhatsApp Cloud
 * channel: the backend 302s to Facebook's consent screen.
 */
export async function GET(req: NextRequest) {
  try {
    const clinicId = await resolveClinicId();
    const location = await apiClient.redirectLocation(
      `/clinics/${clinicId}/auth/facebook`,
    );
    return NextResponse.redirect(location);
  } catch {
    return NextResponse.redirect(
      new URL("/settings?integration_error=meta", req.url),
    );
  }
}

/** Disconnects the Meta WhatsApp Cloud account from the clinic. */
export async function DELETE() {
  try {
    const clinicId = await resolveClinicId();
    await apiClient.delete(
      `/clinics/${clinicId}/messaging/whatsapp/connections`,
    );
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: "Não foi possível desconectar a Meta." },
      { status },
    );
  }
}
