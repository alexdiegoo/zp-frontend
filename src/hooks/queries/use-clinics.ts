import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CreateClinicDto } from "@/lib/validations/clinic";
import type { Clinic } from "@/types/api";

export const clinicKeys = {
  all: ["clinics"] as const,
  list: () => [...clinicKeys.all, "list"] as const,
};

/** Reads `{ data }` from a BFF Route Handler, surfacing its error message. */
async function getData<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      json && typeof json.error === "string"
        ? json.error
        : "Algo deu errado. Tente novamente.";
    throw new Error(message);
  }
  return json.data as T;
}

/** Clinics (tenants) owned by the current user. */
export function useClinics() {
  return useQuery({
    queryKey: clinicKeys.list(),
    queryFn: () => getData<Clinic[]>("/api/clinics"),
    staleTime: 1000 * 60 * 5,
  });
}

/** Creates a clinic and refreshes the clinic list. */
export function useCreateClinic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: CreateClinicDto) => {
      const res = await fetch("/api/clinics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const message =
          json && typeof json.error === "string"
            ? json.error
            : "Não foi possível criar a clínica. Tente novamente.";
        throw new Error(message);
      }
      return json.data as Clinic;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clinicKeys.list() });
    },
  });
}
