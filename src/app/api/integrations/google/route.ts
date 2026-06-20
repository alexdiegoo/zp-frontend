import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";

/**
 * Starts the Google OAuth flow: the backend 302s to Google's consent screen.
 * The browser navigates here directly (full-page), so we forward the redirect.
 */
export async function GET(req: NextRequest) {
  try {
    const clinicId = await resolveClinicId();
    const location = await apiClient.redirectLocation(
      `/clinics/${clinicId}/auth/google`,
    );
    return NextResponse.redirect(location);
  } catch {
    // Bounce back to settings with an error flag the view can surface.
    return NextResponse.redirect(
      new URL("/settings?integration_error=google", req.url),
    );
  }
}

/** Disconnects the Google Calendar account from the clinic. */
export async function DELETE() {
  try {
    const clinicId = await resolveClinicId();
    await apiClient.delete(
      `/clinics/${clinicId}/scheduling/google-calendar/connection`,
    );
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: "Não foi possível desconectar o Google." },
      { status },
    );
  }
}
