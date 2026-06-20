import { useMutation } from "@tanstack/react-query";

import { sendJson } from "@/lib/api/http";
import type { LoginDto, RegisterPayload } from "@/lib/validations/auth";
import type { AuthResponse } from "@/types/api";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export function useLogin() {
  return useMutation({
    mutationFn: (values: LoginDto) =>
      sendJson<AuthResponse>("/api/auth/login", values),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (values: RegisterPayload) =>
      sendJson<AuthResponse>("/api/auth/register", values),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => sendJson<{ ok: true }>("/api/auth/logout", {}),
  });
}
