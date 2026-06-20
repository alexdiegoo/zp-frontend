import { useMutation } from "@tanstack/react-query";

import type { LoginDto, RegisterPayload } from "@/lib/validations/auth";
import type { AuthResponse } from "@/types/api";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

/** POST a JSON body to a BFF Route Handler, surfacing its error message. */
async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      data && typeof data.error === "string"
        ? data.error
        : "Algo deu errado. Tente novamente.";
    throw new Error(message);
  }

  return data as T;
}

export function useLogin() {
  return useMutation({
    mutationFn: (values: LoginDto) =>
      postJson<AuthResponse>("/api/auth/login", values),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (values: RegisterPayload) =>
      postJson<AuthResponse>("/api/auth/register", values),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => postJson<{ ok: true }>("/api/auth/logout", {}),
  });
}
