import { getSessionToken } from "@/lib/auth-session";

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
    throw new ApiError(
      res.status,
      extractMessage(data) ?? `API error: ${res.status}`,
      data,
    );
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, body, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, undefined, options),
};
