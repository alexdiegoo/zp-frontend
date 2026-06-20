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

/* ------------------------------------------------------------------ *
 * Patients (the backend calls these "customers")
 * ------------------------------------------------------------------ */

/**
 * A patient/contact as returned by the CRM listing
 * (`GET /clinics/:clinicId/customers`). The backend names this resource
 * *customer*; we keep the domain term *patient* in the frontend.
 */
export type Patient = {
  id: string;
  name: string;
  email: string | null;
  whatsappNumber: string;
  acquisitionSource: string | null;
  createdAt: string;
};

/** Standard `{ data, meta }` paginated envelope used by the backend. */
export type Paginated<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

/** `GET /clinics/:clinicId/customers` → 200 (paginated patient listing). */
export type PatientsListResponse = Paginated<Patient>;

/** One past service entry in a patient's history (`serviceHistory[]`). */
export type PatientServiceEntry = {
  id: string;
  performedAt: string | null;
  priceCharged: number | null;
  notes: string | null;
  procedure: { id: string; name: string } | null;
  professional: { id: string; name: string } | null;
  appointment: { id: string; startAt: string; status: string } | null;
};

/** Aggregate stats shown on the patient detail page. */
export type PatientStats = {
  totalAppointments: number;
  lastAppointment: string | null;
  lifetimeValue: number;
};

/**
 * Full patient profile returned by
 * `GET /clinics/:clinicId/customers/:customerId`, including service history
 * and lifetime-value stats.
 */
export type PatientDetail = Patient & {
  birthDate: string | null;
  address: string | null;
  serviceHistory: PatientServiceEntry[];
  stats: PatientStats;
};

/* ------------------------------------------------------------------ *
 * Procedures (the clinic's service catalog)
 * ------------------------------------------------------------------ */

/**
 * A catalog procedure (`ProcedureDto`) as returned by
 * `GET /clinics/:clinicId/catalog/procedures`. `basePrice` is the registered
 * starting price; `currentPrice` reflects the latest price-history entry.
 */
export type Procedure = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number | null;
  currentPrice: number | null;
  isActive: boolean;
  createdAt: string;
};

/** `GET /clinics/:clinicId/catalog/procedures` → 200 (paginated listing). */
export type ProceduresListResponse = Paginated<Procedure>;

/**
 * One price-history entry for a procedure
 * (`GET /clinics/:clinicId/catalog/procedures/:procedureId/prices`).
 * `effectiveTo === null` ⇒ the currently-vigent price.
 */
export type ProcedurePrice = {
  id: string;
  procedureId: string;
  amount: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  isCurrent: boolean;
  createdAt: string;
};

/**
 * Full procedure detail: the catalog entry plus its complete price history.
 * The backend has no single-procedure GET, so our BFF composes this from the
 * listing and the prices endpoint (see `app/api/procedures/[id]/route.ts`).
 */
export type ProcedureDetail = Procedure & {
  priceHistory: ProcedurePrice[];
};
