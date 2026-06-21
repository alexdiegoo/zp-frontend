import { z } from "zod";

import type { TemplateDetail } from "@/types/api";

/**
 * Validates the template list query (`page`, `limit`) in the Route Handler
 * before forwarding to the backend `GET /clinics/:clinicId/messaging/templates`.
 * The backend caps `limit` at 100 and defaults to 50; we default to 20 to match
 * the rest of the dashboard's paginated listings.
 */
export const templatesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type TemplatesQuery = z.infer<typeof templatesQuerySchema>;

/**
 * Body for `POST /clinics/:clinicId/messaging/templates/sync`. An absent
 * `templateId` syncs every template; the listing's "Sincronizar" button uses
 * exactly that (sync-all).
 */
export const syncTemplatesSchema = z.object({
  templateId: z.string().min(1).optional(),
});

/* ------------------------------------------------------------------ *
 * Template creation (the "Novo template" editor)
 * ------------------------------------------------------------------ */

/** Categories the editor offers (the backend also accepts AUTHENTICATION). */
export const TEMPLATE_CATEGORY_OPTIONS = [
  { value: "UTILITY", label: "Utilidade" },
  { value: "MARKETING", label: "Marketing" },
] as const;

/**
 * Header kinds the editor's "Tipo de mídia" select offers. `NONE` is the
 * default and still reveals an optional text-header input — a filled text field
 * under `NONE` becomes a `TEXT` header on submit (see `toCreateTemplatePayload`).
 */
export const TEMPLATE_HEADER_TYPES = ["NONE", "IMAGE"] as const;

/** Button kinds offered by the "Adicionar botão" menu. */
export const TEMPLATE_BUTTON_TYPES = ["QUICK_REPLY", "URL"] as const;

/** Maximum number of buttons a template may carry (Meta limit). */
export const TEMPLATE_MAX_BUTTONS = 10;

/** Body/header/footer length caps (mirror `ZAPBLAST_BACKEND_API.md`). */
export const TEMPLATE_BODY_MAX = 1024;
export const TEMPLATE_HEADER_TEXT_MAX = 60;
export const TEMPLATE_FOOTER_MAX = 60;
export const TEMPLATE_BUTTON_TEXT_MAX = 25;
export const TEMPLATE_BUTTON_URL_MAX = 2000;

/** Accepted header-image MIME types and size cap for the upload field. */
export const TEMPLATE_HEADER_IMAGE_TYPES = ["image/png", "image/jpeg"] as const;
export const TEMPLATE_HEADER_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const buttonFormSchema = z.object({
  type: z.enum(TEMPLATE_BUTTON_TYPES),
  text: z
    .string()
    .trim()
    .min(1, "Informe o texto do botão.")
    .max(TEMPLATE_BUTTON_TEXT_MAX, `Máx ${TEMPLATE_BUTTON_TEXT_MAX} caracteres.`),
  // Only meaningful for URL buttons; required-ness is enforced in superRefine.
  url: z.string().trim().max(TEMPLATE_BUTTON_URL_MAX, "URL muito longa.").optional(),
});

/**
 * Raw form schema validated client-side by the "Novo template" editor. The
 * header type carries the UI-only `NONE` sentinel; `toCreateTemplatePayload`
 * strips it before the request. Conditional rules (header text/media, URL
 * buttons) live in `superRefine` so they only fire for the relevant shape.
 */
export const createTemplateFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Informe o nome.")
      .max(512, "Máx 512 caracteres.")
      .regex(
        /^[a-z0-9_]+$/,
        "Apenas letras minúsculas, números e underscore.",
      ),
    language: z.literal("pt_BR"),
    category: z.enum(["UTILITY", "MARKETING"], {
      message: "Selecione a categoria.",
    }),
    headerType: z.enum(TEMPLATE_HEADER_TYPES),
    headerText: z.string().optional(),
    headerMediaUrl: z.string().optional(),
    bodyText: z
      .string()
      .trim()
      .min(1, "Informe o corpo da mensagem.")
      .max(TEMPLATE_BODY_MAX, `Máx ${TEMPLATE_BODY_MAX} caracteres.`),
    footer: z
      .string()
      .trim()
      .max(TEMPLATE_FOOTER_MAX, `Máx ${TEMPLATE_FOOTER_MAX} caracteres.`)
      .optional(),
    buttons: z
      .array(buttonFormSchema)
      .max(TEMPLATE_MAX_BUTTONS, `Máx ${TEMPLATE_MAX_BUTTONS} botões.`)
      .optional(),
    variableExamples: z
      .record(z.string(), z.string().max(512, "Máx 512 caracteres.").optional())
      .optional(),
  })
  .superRefine((values, ctx) => {
    // The text-header input only shows under `NONE`; validate it when filled.
    if (values.headerType === "NONE") {
      const text = values.headerText?.trim() ?? "";
      if (text.length > TEMPLATE_HEADER_TEXT_MAX) {
        ctx.addIssue({
          code: "custom",
          path: ["headerText"],
          message: `Máx ${TEMPLATE_HEADER_TEXT_MAX} caracteres.`,
        });
      } else if (/[\n\r]/.test(text)) {
        ctx.addIssue({
          code: "custom",
          path: ["headerText"],
          message: "Sem quebras de linha.",
        });
      } else if (/\p{Extended_Pictographic}/u.test(text)) {
        ctx.addIssue({
          code: "custom",
          path: ["headerText"],
          message: "Sem emoji.",
        });
      }
    }

    if (values.headerType === "IMAGE" && !values.headerMediaUrl) {
      ctx.addIssue({
        code: "custom",
        path: ["headerMediaUrl"],
        message: "Envie a imagem do cabeçalho.",
      });
    }

    values.buttons?.forEach((button, index) => {
      if (button.type !== "URL") return;
      const url = button.url?.trim() ?? "";
      if (!url) {
        ctx.addIssue({
          code: "custom",
          path: ["buttons", index, "url"],
          message: "Informe a URL.",
        });
      } else if (!/^https?:\/\/.+/i.test(url)) {
        ctx.addIssue({
          code: "custom",
          path: ["buttons", index, "url"],
          message: "Informe uma URL válida (http/https).",
        });
      }
    });
  });

export type CreateTemplateForm = z.infer<typeof createTemplateFormSchema>;

/** Cleaned wire payload forwarded by the BFF to the backend. */
export type CreateTemplatePayload = {
  name: string;
  category: "UTILITY" | "MARKETING";
  language: "pt_BR";
  bodyText: string;
  headerType?: "TEXT" | "IMAGE";
  headerText?: string;
  headerMediaUrl?: string;
  footer?: string;
  buttons?: { type: "QUICK_REPLY" | "URL"; text: string; url?: string }[];
  variableExamples?: Record<string, string>;
};

/**
 * Converts validated form values into the backend request body: drops the
 * `NONE` header sentinel, prunes empty optionals, and keeps only example
 * values for variables still present in the body.
 */
export function toCreateTemplatePayload(
  values: CreateTemplateForm,
  variables: string[],
): CreateTemplatePayload {
  const payload: CreateTemplatePayload = {
    name: values.name,
    category: values.category,
    language: values.language,
    bodyText: values.bodyText,
  };

  if (values.headerType === "IMAGE" && values.headerMediaUrl) {
    payload.headerType = "IMAGE";
    payload.headerMediaUrl = values.headerMediaUrl;
  } else if (values.headerType === "NONE" && values.headerText?.trim()) {
    payload.headerType = "TEXT";
    payload.headerText = values.headerText.trim();
  }

  if (values.footer?.trim()) payload.footer = values.footer.trim();

  const buttons = values.buttons
    ?.map((button) =>
      button.type === "URL"
        ? { type: "URL" as const, text: button.text, url: button.url?.trim() }
        : { type: "QUICK_REPLY" as const, text: button.text },
    )
    .filter((button) => button.text.length > 0);
  if (buttons && buttons.length > 0) payload.buttons = buttons;

  const examples: Record<string, string> = {};
  for (const name of variables) {
    const value = values.variableExamples?.[name]?.trim();
    if (value) examples[name] = value;
  }
  if (Object.keys(examples).length > 0) payload.variableExamples = examples;

  return payload;
}

/**
 * Maps a fetched template into the editor's form shape so the edit page mounts
 * prefilled. The inverse of {@link toCreateTemplatePayload}: a stored `TEXT`
 * header is surfaced in the `NONE` text input, and categories the editor does
 * not offer (e.g. `AUTHENTICATION`) fall back to `MARKETING`.
 */
export function toTemplateFormValues(
  template: TemplateDetail,
): CreateTemplateForm {
  const headerType = template.headerType === "IMAGE" ? "IMAGE" : "NONE";
  const category =
    template.category === "UTILITY" || template.category === "MARKETING"
      ? template.category
      : "MARKETING";

  return {
    name: template.name,
    language: "pt_BR",
    category,
    headerType,
    headerText:
      template.headerType === "TEXT" ? (template.headerText ?? "") : "",
    headerMediaUrl:
      headerType === "IMAGE" ? (template.headerMediaUrl ?? "") : "",
    bodyText: template.bodyText ?? "",
    footer: template.footer ?? "",
    buttons: (template.buttons ?? []).map((button) =>
      button.type === "URL"
        ? { type: "URL" as const, text: button.text, url: button.url ?? "" }
        : { type: "QUICK_REPLY" as const, text: button.text },
    ),
    variableExamples: { ...template.variableExamples },
  };
}

/**
 * Server-side schema the Route Handler re-validates the create body against
 * before forwarding (button text widened to the backend's 1–40 cap).
 */
export const createTemplateSchema = z.object({
  name: z
    .string()
    .regex(/^[a-z0-9_]+$/)
    .min(1)
    .max(512),
  category: z.enum(["UTILITY", "MARKETING", "AUTHENTICATION"]),
  language: z.string().min(1),
  bodyText: z.string().min(1).max(TEMPLATE_BODY_MAX),
  headerType: z.enum(["TEXT", "IMAGE"]).optional(),
  headerText: z.string().max(TEMPLATE_HEADER_TEXT_MAX).optional(),
  headerMediaUrl: z.string().url().optional(),
  footer: z.string().max(TEMPLATE_FOOTER_MAX).optional(),
  buttons: z
    .array(
      z.object({
        type: z.enum(TEMPLATE_BUTTON_TYPES),
        text: z.string().min(1).max(40),
        url: z.string().max(TEMPLATE_BUTTON_URL_MAX).optional(),
      }),
    )
    .max(TEMPLATE_MAX_BUTTONS)
    .optional(),
  variableExamples: z.record(z.string(), z.string().max(512)).optional(),
});
