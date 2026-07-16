import { z } from "zod";
import type { useTranslations } from "next-intl";

// Translator for the `validation` message namespace. The SAME schema logic is
// shared between client and server (Principle V); only the message *source*
// differs — the client passes a real `useTranslations("validation")` so errors
// render in the active language (research Decision 7), while the static exports
// below use pt-BR defaults for server-side validation and type inference.
type ValidationT = ReturnType<typeof useTranslations<"validation">>;

/** pt-BR fallback messages for the static (server/type) schemas. */
const PT_BR_VALIDATION: Record<string, string> = {
  "email.required": "Informe seu e-mail.",
  "email.invalid": "Informe um e-mail válido.",
  "password.min": "A senha deve ter ao menos 8 caracteres.",
  "name.min": "Informe seu nome completo.",
  "confirmPassword.required": "Confirme sua senha.",
  "confirmPassword.mismatch": "As senhas não coincidem.",
};

const ptValidation = ((key: string) =>
  PT_BR_VALIDATION[key] ?? key) as unknown as ValidationT;

// The backend requires a password of at least 8 characters (ZAPBLAST_BACKEND_API.md).
function buildLoginSchema(t: ValidationT) {
  return z.object({
    email: z.string().min(1, t("email.required")).email(t("email.invalid")),
    password: z.string().min(8, t("password.min")),
  });
}

/** Client factory — pass `useTranslations("validation")` for localized messages. */
export const makeLoginSchema = buildLoginSchema;
/** Static schema (pt-BR) for the Route Handler + type inference. */
export const loginSchema = buildLoginSchema(ptValidation);
export type LoginDto = z.infer<typeof loginSchema>;

// Full client-side form schema (includes UI-only fields not sent to the backend).
function buildRegisterSchema(t: ValidationT) {
  return z
    .object({
      name: z.string().trim().min(2, t("name.min")),
      email: z.string().min(1, t("email.required")).email(t("email.invalid")),
      password: z.string().min(8, t("password.min")),
      confirmPassword: z.string().min(1, t("confirmPassword.required")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("confirmPassword.mismatch"),
      path: ["confirmPassword"],
    });
}

export const makeRegisterSchema = buildRegisterSchema;
export const registerSchema = buildRegisterSchema(ptValidation);
export type RegisterDto = z.infer<typeof registerSchema>;

// The exact payload forwarded to `POST /api/v1/users` — shared between the
// register form's submit handler and `POST /api/auth/register`.
function buildRegisterApiSchema(t: ValidationT) {
  return z.object({
    name: z.string().trim().min(2, t("name.min")),
    email: z.string().min(1, t("email.required")).email(t("email.invalid")),
    password: z.string().min(8, t("password.min")),
  });
}

export const makeRegisterApiSchema = buildRegisterApiSchema;
export const registerApiSchema = buildRegisterApiSchema(ptValidation);
export type RegisterPayload = z.infer<typeof registerApiSchema>;
