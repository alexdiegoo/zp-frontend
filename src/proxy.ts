import { NextRequest, NextResponse } from "next/server";

import { CLINIC_COOKIE } from "@/lib/clinic-tenant";

/** One year — mirrors the client-side clinic cookie lifetime. */
const CLINIC_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Next.js 16 route interception. This file replaces the legacy `middleware.ts`
 * (which is silently ignored in Next.js 16) and must export a function named
 * `proxy`.
 *
 * Responsibilities:
 * - Translate the backend OAuth success URL into this app's routing (see
 *   `rewriteCompanySettings`).
 * - Guard authenticated areas behind the `zapblast_token` cookie and bounce
 *   already-authenticated users away from the auth pages.
 */
export function proxy(request: NextRequest) {
  const companySettings = rewriteCompanySettings(request);
  if (companySettings) return companySettings;

  const token = request.cookies.get("zapblast_token");
  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  // The root (`/`) is now the public marketing landing — open to anonymous
  // visitors. The authenticated app home moved to `/dashboard`.
  const isProtected = pathname.startsWith("/dashboard");

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

/**
 * The backend's OAuth callbacks (Google/Meta) redirect the browser to a
 * per-company success URL — `/companies/:clinicId/settings?tab=…&…_connected=true`.
 * This app routes settings at the root (`/settings`) and tracks the active
 * clinic in the `zapblast_clinic` cookie, so that URL would 404.
 *
 * Translate it into our own route: adopt the clinic from the path (so the
 * tenant matches the account that was just connected) and forward the OAuth
 * result flags (`tab`, `*_connected`) to the settings page untouched. Returns
 * `null` when the request isn't a company-settings URL.
 */
function rewriteCompanySettings(request: NextRequest): NextResponse | null {
  const match = request.nextUrl.pathname.match(
    /^\/companies\/(\d+)\/settings\/?$/,
  );
  if (!match) return null;

  const clinicId = match[1];
  const url = request.nextUrl.clone();
  url.pathname = "/settings";
  // clone() keeps the search params (tab, google_connected, …) intact.

  const response = NextResponse.redirect(url);
  response.cookies.set(CLINIC_COOKIE, clinicId, {
    path: "/",
    maxAge: CLINIC_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
