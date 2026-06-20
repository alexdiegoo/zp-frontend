import { NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { setSessionCookie } from "@/lib/auth-session";
import { registerApiSchema } from "@/lib/validations/auth";
import type {
  AuthResponse,
  LoginBackendResponse,
  RegisterBackendResponse,
} from "@/types/api";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = registerApiSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    // 1. Create the account. The backend's register endpoint does not return a
    //    token, so we cannot start a session from its response alone.
    await apiClient.post<RegisterBackendResponse>("/users", parsed.data, {
      auth: false,
    });

    // 2. Authenticate with the same credentials to obtain the access token and
    //    sign the user in immediately after registration.
    const login = await apiClient.post<LoginBackendResponse>(
      "/users/login",
      { email: parsed.data.email, password: parsed.data.password },
      { auth: false },
    );

    await setSessionCookie(login.accessToken);

    const response: AuthResponse = { user: login.user };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      const message =
        error.status === 409
          ? "Este e-mail já está cadastrado."
          : "Não foi possível criar a conta. Tente novamente.";
      return NextResponse.json({ error: message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Erro inesperado. Tente novamente." },
      { status: 500 },
    );
  }
}
