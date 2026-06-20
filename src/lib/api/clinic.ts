import { cookies } from "next/headers";

import { apiClient } from "@/lib/api/api-client";
import { CLINIC_COOKIE } from "@/lib/clinic-tenant";
import type { ClinicsBackendResponse } from "@/types/api";

/**
 * Resolves the clinic (tenant) the current request acts on.
 *
 * Most backend resources are scoped by `clinicId` (see `ZAPBLAST_BACKEND_API.md`).
 * The active clinic is chosen client-side by the clinic switcher and stored in
 * the `zapblast_clinic` cookie: that cookie wins here, otherwise we fall back to
 * the user's first clinic (matching the switcher's own default).
 *
 * Only ever called from Route Handlers (`app/api/**`).
 */
export async function resolveClinicId(): Promise<number> {
  const store = await cookies();
  const fromCookie = store.get(CLINIC_COOKIE)?.value;
  if (fromCookie && Number.isFinite(Number(fromCookie))) {
    return Number(fromCookie);
  }

  const { companies } = await apiClient.get<ClinicsBackendResponse>("/clinics");
  const first = companies[0];
  if (!first) {
    throw new Error("NO_CLINIC");
  }
  return first.id;
}
