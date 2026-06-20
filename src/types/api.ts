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

/* ------------------------------------------------------------------ *
 * Clinics (tenants)
 * ------------------------------------------------------------------ */

/** A clinic (tenant) owned by the user. Also called *company* by the backend. */
export type Clinic = {
  id: number;
  name: string;
  category: string;
};

/** `GET /api/v1/clinics` → 200 */
export type ClinicsBackendResponse = {
  companies: Clinic[];
};

/** `POST /api/v1/clinics` → 201 */
export type CreateClinicBackendResponse = {
  company: Clinic;
};

/* ------------------------------------------------------------------ *
 * Integrations
 * ------------------------------------------------------------------ */

/** A platform integration the clinic can connect. */
export type IntegrationProvider = "google" | "meta" | "whatsapp";

/** `GET /clinics/:id/scheduling/google-calendar/connection` */
export type GoogleCalendarConnection = {
  userId: number;
  email: string;
  connectedAt: string;
  expiresAt: string | null;
};

/** Meta WhatsApp Cloud (official) connection — opaque-ish; we read it defensively. */
export type ChannelConnection = {
  id?: string;
  phoneNumber?: string;
  displayName?: string;
  wabaName?: string;
};

/** Evolution (unofficial) WhatsApp connection. */
export type ChannelEvolutionConnection = {
  id: string;
  instanceId?: string;
  instanceName?: string;
  pairingCode?: string | null;
  phoneNumber?: string | null;
  profileName?: string | null;
  qrCode?: string | null;
  status?: string | null;
};

/**
 * Normalized status of a single integration, as returned by our BFF
 * (`GET /api/integrations`). The UI only needs "connected?" plus a short
 * detail line — never the raw provider payload.
 */
export type IntegrationStatus = {
  connected: boolean;
  /** Short human label shown under the title when connected (email, phone…). */
  detail: string | null;
};

/** Aggregate status of every integration. */
export type IntegrationsStatus = Record<IntegrationProvider, IntegrationStatus>;
