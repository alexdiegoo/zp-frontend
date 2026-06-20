/** Response/request types mirroring the ZapBlast backend (`ZAPBLAST_BACKEND_API.md`). */

/** The authenticated user profile returned by the backend auth endpoints. */
export type AuthUser = {
  id: number;
  email: string;
  name: string;
  googleCalendarConnected: boolean;
};

/** `POST /api/v1/users/login` → 200 */
export type LoginBackendResponse = {
  accessToken: string;
  user: AuthUser;
};

/** `POST /api/v1/users` → 201 */
export type RegisterBackendResponse = {
  user: AuthUser;
};

/**
 * Shape returned by our BFF auth Route Handlers. The `accessToken` is stripped
 * and stored as an httpOnly cookie server-side — it never reaches the client.
 */
export type AuthResponse = {
  user: AuthUser;
};

/** Normalized error body returned by our Route Handlers. */
export type ApiErrorResponse = {
  error: string | Record<string, string[] | undefined>;
};
