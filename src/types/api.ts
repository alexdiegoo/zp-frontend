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

/* ------------------------------------------------------------------ *
 * Professionals (clinic staff)
 * ------------------------------------------------------------------ */

/** A professional/collaborator of the clinic (`GET /clinics/:id/professionals`). */
export type Professional = {
  id: string;
  name: string;
  createdAt?: string;
};

/* ------------------------------------------------------------------ *
 * Scheduling — appointments (the calendar)
 * ------------------------------------------------------------------ */

/** Appointment kind. PROCEDURE additionally carries a charged price in the UI. */
export type AppointmentType = "CONSULTATION" | "PROCEDURE" | "RETURN";

/** Lifecycle status reported by the backend. */
export type AppointmentStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "DONE"
  | "CANCELLED"
  | "NO_SHOW";

/**
 * An appointment as returned by the scheduling endpoints (`AppointmentResponseDto`).
 * `startAt`/`endAt` are ISO 8601 strings; the calendar positions cards from them.
 */
export type Appointment = {
  id: string;
  clinicId: number;
  type: AppointmentType;
  status: AppointmentStatus;
  startAt: string;
  endAt: string;
  patient: { id: string; name: string; whatsappNumber: string };
  patientId: string;
  procedure: { id: string; name: string } | null;
  procedureId: string | null;
  professional: { id: string; name: string } | null;
  professionalId: string | null;
  parentAppointmentId: string | null;
  /**
   * Procedure-record snapshot created with the appointment. `priceCharged` is
   * seeded from the procedure's catalog price at creation time and is the value
   * forwarded back when confirming completion (status → DONE).
   */
  procedureRecord: {
    id: string;
    status: "SCHEDULED" | "DONE" | "CANCELLED";
    priceCharged: number | null;
    performedAt: string;
    notes: string | null;
    procedureId: string;
    professionalId: string | null;
  } | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * `GET /clinics/:clinicId/scheduling/appointments` → 200. The backend returns a
 * bare array (not the `{ data, meta }` envelope) for a date-window listing.
 */
export type AppointmentsListResponse = Appointment[];

/* ------------------------------------------------------------------ *
 * Messaging — WhatsApp message templates
 * ------------------------------------------------------------------ */

/**
 * Lifecycle of a local template, mirroring the Meta submission state
 * (`MessageTemplateStatus`). `DRAFT` is created locally; the rest reflect the
 * status reported back by the Meta WhatsApp Cloud review.
 */
export type TemplateStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "PAUSED"
  | "DISABLED";

/** Meta template category (`MessageTemplateCategory`). */
export type TemplateCategory =
  | "MARKETING"
  | "UTILITY"
  | "AUTHENTICATION"
  | "UNKNOWN";

/** Header kind of a template (`MessageTemplateHeaderType`). */
export type TemplateHeaderType =
  | "NONE"
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "DOCUMENT";

/**
 * A template row as returned by the local listing
 * (`GET /clinics/:clinicId/messaging/templates`). `status`/`category` are
 * widened to `string` defensively in case the backend reports a value the
 * frontend doesn't yet model.
 */
export type Template = {
  id: string;
  name: string;
  category: TemplateCategory | string;
  status: TemplateStatus | string;
  /** Language tag, e.g. `pt_BR`. */
  language: string;
  createdAt: string;
};

/** `GET /clinics/:clinicId/messaging/templates` → 200 (paginated listing). */
export type TemplatesListResponse = Paginated<Template>;

/** `POST /clinics/:clinicId/messaging/templates/sync` → 200. */
export type SyncTemplatesResponse = {
  syncedCount: number;
};

/** A button attached to a template (`QUICK_REPLY` or `URL`). */
export type TemplateButton = {
  text: string;
  type: string;
  url?: string;
};

/** A variable placeholder declared in the template body. */
export type TemplateVariable = {
  name: string;
};

/**
 * Full template detail (`GET /clinics/:clinicId/messaging/templates/:id`):
 * the listing fields plus body, header, buttons, footer and variables.
 */
export type TemplateDetail = Template & {
  /** Body with `{{var}}` placeholders substituted by their example values. */
  bodyPreview: string | null;
  bodyText: string | null;
  buttons: TemplateButton[] | null;
  footer: string | null;
  headerType: TemplateHeaderType | string;
  headerText: string | null;
  headerMediaUrl: string | null;
  metaTemplateId: string | null;
  variableExamples: Record<string, string>;
  variableMapping: TemplateVariable[];
  updatedAt: string;
};
