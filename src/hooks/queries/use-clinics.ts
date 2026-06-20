import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getData, postData } from "@/lib/api/http";
import type { CreateClinicDto } from "@/lib/validations/clinic";
import type { Clinic } from "@/types/api";

export const clinicKeys = {
  all: ["clinics"] as const,
  list: () => [...clinicKeys.all, "list"] as const,
};

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
    mutationFn: (values: CreateClinicDto) =>
      postData<Clinic>(
        "/api/clinics",
        values,
        "Não foi possível criar a clínica. Tente novamente.",
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clinicKeys.list() });
    },
  });
}
