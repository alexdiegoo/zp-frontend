import { clearSessionCookie, getSessionToken } from "@/lib/auth-session";

/**
 * Server-side fetch wrapper for the ZapBlast backend (BFF bridge).
 *
 * Only ever called from Route Handlers (`app/api/**`) — never from the client.
 * It reads the httpOnly session cookie and forwards it to the backend as a
 * Bearer token. All domain routes live under `/api/v1` (see
 * `ZAPBLAST_BACKEND_API.md`).
 */
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3333";
const API_BASE = `${BACKEND_URL}/api/v1`;

/** Error carrying the backend HTTP status + parsed body so handlers can map it. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  params?: Record<string, unknown>;
  /** Set `false` for public endpoints (login/register) to skip the token. */
  auth?: boolean;
};

function extractMessage(body: unknown): string | undefined {
  if (body && typeof body === "object" && "message" in body) {
    const { message } = body as { message?: unknown };
    if (typeof message === "string") return message;
  }
  if (body && typeof body === "object" && "error" in body) {
    const { error } = body as { error?: unknown };
    if (typeof error === "string") return error;
  }
  return undefined;
}

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const token = options?.auth === false ? undefined : await getSessionToken();

  const url = new URL(`${API_BASE}${path}`);
  if (options?.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    // An authenticated request rejected with 401 means the session token is
    // expired/invalid — drop the cookie so the proxy gate stops treating the
    // user as logged in. Public endpoints (login/register, `auth: false`) are
    // skipped: a 401 there is just bad credentials, not an expired session.
    if (res.status === 401 && options?.auth !== false) {
      await clearSessionCookie();
    }
    throw new ApiError(
      res.status,
      extractMessage(data) ?? `API error: ${res.status}`,
      data,
    );
  }

  return data as T;
}

/**
 * Issues a GET the backend answers with a redirect (e.g. the OAuth start
 * endpoints, which 302 to the Google/Meta authorization URL) and returns the
 * `Location` without following it. Used by the BFF to bounce the browser to the
 * provider's consent screen while still forwarding the session token.
 */
async function redirectLocation(path: string): Promise<string> {
  const token = await getSessionToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    redirect: "manual",
    cache: "no-store",
  });

  const location = res.headers.get("location");
  if (location) return location;

  const body = await res.json().catch(() => null);
  throw new ApiError(
    res.status,
    extractMessage(body) ?? `Expected a redirect but got ${res.status}`,
    body,
  );
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, undefined, options),
  redirectLocation,
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, body, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, undefined, options),
};
