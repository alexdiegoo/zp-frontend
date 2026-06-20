/**
 * The active clinic (tenant) is the single piece of cross-cutting app state:
 * almost every backend resource is scoped by `clinicId` (see
 * `ZAPBLAST_BACKEND_API.md`). We persist the selection in a plain (non-httpOnly)
 * cookie so it is shared by both worlds:
 *
 * - **Server** (`lib/api/clinic.ts` → `resolveClinicId`) reads it to scope every
 *   BFF request to the active clinic.
 * - **Client** (the clinic switcher) reads it to restore the selection across
 *   reloads and writes it when the user switches clinics.
 *
 * It holds no secret — just a clinic id the user already owns — so it does not
 * need to be httpOnly, and being readable client-side is what keeps both sides
 * in agreement. This module is import-safe on the server (no `next/headers`).
 */
export const CLINIC_COOKIE = "zapblast_clinic";

/** One year — the selection should survive across sessions until changed. */
const CLINIC_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Read the active clinic id from the cookie (client-side only). */
export function readActiveClinicId(): number | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CLINIC_COOKIE}=`));
  if (!entry) return null;
  const value = Number(entry.slice(CLINIC_COOKIE.length + 1));
  return Number.isFinite(value) ? value : null;
}

/** Persist the active clinic id (client-side only). */
export function writeActiveClinicId(id: number): void {
  if (typeof document === "undefined") return;
  document.cookie = `${CLINIC_COOKIE}=${id}; path=/; max-age=${CLINIC_COOKIE_MAX_AGE}; samesite=lax`;
}
