import type { Locale } from "@/i18n/config";

/**
 * Name of the locale cookie. Written by the login Route Handler (seeded from
 * the account preference) and `POST /api/preferences/locale`; read server-side
 * on every request in `src/i18n/request.ts`.
 */
export const LOCALE_COOKIE = "locale";

/** ~1 year — the preference should survive well beyond a session. */
const LOCALE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Shared cookie attributes for the `locale` cookie. `httpOnly` is safe because
 * the value is only ever read server-side (the switcher relies on
 * `router.refresh()`, never on reading the cookie in JS) — research Decision 4.
 */
export function localeCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: LOCALE_MAX_AGE,
  };
}

/** Shape accepted by both `NextResponse.cookies` and the `cookies()` store. */
export function localeCookie(locale: Locale) {
  return {
    name: LOCALE_COOKIE,
    value: locale,
    ...localeCookieOptions(),
  };
}
