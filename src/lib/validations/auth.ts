import { z } from "zod";

// Shared between the login form and `POST /api/auth/login`. The backend requires
// a password of at least 8 characters (see ZAPBLAST_BACKEND_API.md).
export const loginSchema = z.object({
  email: z.string().min(1, "Informe seu e-mail.").email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
});

export type LoginDto = z.infer<typeof loginSchema>;

// Full client-side form schema (includes UI-only fields not sent to the backend).
export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome completo."),
    email: z.string().min(1, "Informe seu e-mail.").email("Informe um e-mail válido."),
    password: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirme sua senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type RegisterDto = z.infer<typeof registerSchema>;

// The exact payload forwarded to `POST /api/v1/users` — shared between the
// register form's submit handler and `POST /api/auth/register`.
export const registerApiSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome completo."),
  email: z.string().min(1, "Informe seu e-mail.").email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
});

export type RegisterPayload = z.infer<typeof registerApiSchema>;
