"use client";

/**
 * Client-side fetch helpers for the BFF Route Handlers (`app/api/**`).
 *
 * Every client data hook funnels through here so error handling lives in one
 * place. A non-ok response throws an {@link HttpError} carrying the HTTP status,
 * which lets the global cache handler in `app/providers.tsx` detect a `401`
 * (expired/invalid session) and bounce the user to the login screen.
 */

const FALLBACK_ERROR = "Algo deu errado. Tente novamente.";

/** Error carrying the BFF response status so callers can branch on it (e.g. 401). */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/** Performs the fetch, throwing {@link HttpError} on a non-ok response. Returns `null` for 204. */
async function request<T>(
  url: string,
  init: RequestInit | undefined,
  fallback: string,
): Promise<T | null> {
  const res = await fetch(url, init);
  if (res.status === 204) return null;

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      json && typeof json.error === "string" ? json.error : fallback;
    throw new HttpError(res.status, message);
  }

  return json as T;
}

/** GET a BFF route and unwrap its `{ data }` envelope. */
export async function getData<T>(
  url: string,
  fallback = FALLBACK_ERROR,
): Promise<T> {
  const json = await request<{ data: T }>(url, undefined, fallback);
  return (json?.data ?? null) as T;
}

/** POST a JSON body to a BFF route and unwrap its `{ data }` envelope (e.g. create endpoints). */
export async function postData<T>(
  url: string,
  body: unknown,
  fallback = FALLBACK_ERROR,
): Promise<T> {
  const json = await request<{ data: T }>(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    fallback,
  );
  return (json?.data ?? null) as T;
}

/** Send a JSON body to a BFF route and unwrap its `{ data }` envelope (`null` on 204). */
export async function sendData<T>(
  url: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown,
  fallback = FALLBACK_ERROR,
): Promise<T | null> {
  const json = await request<{ data: T }>(
    url,
    {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    },
    fallback,
  );
  return (json?.data ?? null) as T | null;
}

/** Send a JSON body to a BFF route and return the raw response (no `{ data }` unwrap). */
export async function sendJson<T>(
  url: string,
  body: unknown,
  fallback = FALLBACK_ERROR,
): Promise<T> {
  const json = await request<T>(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    fallback,
  );
  return json as T;
}

/** Auth routes the session handler must never bounce away from. */
const AUTH_PATHS = ["/login", "/register"];

let redirecting = false;

/**
 * Reacts to an expired/invalid session: a `401` from any BFF route means the
 * backend rejected our token (the Route Handler has already cleared the session
 * cookie server-side), so we drop all cached data and hard-redirect to login.
 *
 * `replace` (not `push`) so the dead page is not left in history, and a guard
 * flag plus an auth-route check prevent redirect loops and clobbering the inline
 * "wrong credentials" error on the login form itself.
 */
export function handleUnauthorized(error: unknown): void {
  if (!(error instanceof HttpError) || error.status !== 401) return;
  if (typeof window === "undefined" || redirecting) return;
  if (AUTH_PATHS.some((path) => window.location.pathname.startsWith(path))) {
    return;
  }

  redirecting = true;
  window.location.replace("/login");
}
