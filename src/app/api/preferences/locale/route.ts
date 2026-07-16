import { NextResponse, type NextRequest } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { LOCALE_COOKIE, localeCookieOptions } from "@/lib/locale-cookie";
import { localeSchema } from "@/lib/validations/i18n";

/**
 * Sets the active language for the current user (Principle II BFF): validates
 * the locale with the shared schema, forwards the durable preference to the
 * backend user profile (cross-device — FR-005), and sets the `locale` cookie so
 * the current browser reflects the change immediately, regardless of backend
 * latency.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = localeSchema.safeParse(body?.locale);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  // Durable source of truth. The cookie is still set below even if this fails,
  // so the switch is never blocked by an eventually-consistent backend.
  try {
    await apiClient.patch("/me/preferences", { locale: parsed.data });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    // Non-auth backend failures are non-fatal: the cookie still applies the
    // language for this browser; the profile reconciles on the next change.
  }

  const res = NextResponse.json({ data: { locale: parsed.data } });
  res.cookies.set(LOCALE_COOKIE, parsed.data, localeCookieOptions());
  return res;
}
