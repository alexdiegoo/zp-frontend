import { NextRequest, NextResponse } from "next/server";

import { cookies } from "next/headers";

import { isLocale } from "@/i18n/config";
import { apiClient, ApiError } from "@/lib/api/api-client";
import { setSessionCookie } from "@/lib/auth-session";
import { localeCookie } from "@/lib/locale-cookie";
import { loginSchema } from "@/lib/validations/auth";
import type { AuthResponse, LoginBackendResponse } from "@/types/api";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const data = await apiClient.post<LoginBackendResponse>(
      "/users/login",
      parsed.data,
      { auth: false },
    );

    // Establish the session: store the access token as an httpOnly cookie.
    await setSessionCookie(data.accessToken);

    // Seed the locale cookie from the account's stored preference so a returning
    // user on any device opens in their saved language (SC-003, FR-005).
    if (isLocale(data.user.locale)) {
      const store = await cookies();
      store.set(localeCookie(data.user.locale));
    }

    const response: AuthResponse = { user: data.user };
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      const message =
        error.status === 401 || error.status === 400
          ? "E-mail ou senha inválidos."
          : "Não foi possível entrar. Tente novamente.";
      return NextResponse.json({ error: message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Erro inesperado. Tente novamente." },
      { status: 500 },
    );
  }
}
