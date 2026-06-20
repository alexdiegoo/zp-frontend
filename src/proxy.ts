import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js 16 route interception. This file replaces the legacy `middleware.ts`
 * (which is silently ignored in Next.js 16) and must export a function named
 * `proxy`.
 *
 * Guards authenticated areas behind the `zapblast_token` cookie and bounces
 * already-authenticated users away from the auth pages.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get("zapblast_token");
  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isProtected = pathname.startsWith("/dashboard") || pathname === "/";

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
