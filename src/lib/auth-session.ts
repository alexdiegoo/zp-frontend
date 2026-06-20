import { cookies } from "next/headers";

/**
 * Name of the session cookie. Stores the backend `accessToken` as an
 * httpOnly cookie so it is never exposed to client-side JS, and is forwarded
 * as a Bearer token by the BFF (`lib/api/api-client.ts`). The `proxy.ts` gate
 * checks this same cookie to guard authenticated routes.
 */
export const SESSION_COOKIE = "zapblast_token";

/** 7 days, matching a typical access-token lifetime for this app. */
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

/** Persist the backend access token as an httpOnly session cookie. */
export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/** Read the current session token (server-side only). */
export async function getSessionToken() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

/** Clear the session cookie (logout). */
export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
