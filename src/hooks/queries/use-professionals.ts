import { useQuery } from "@tanstack/react-query";

import { getData } from "@/lib/api/http";
import type { Professional } from "@/types/api";

export const professionalKeys = {
  all: ["professionals"] as const,
};

/**
 * The active clinic's professionals — a small, rarely-changing list loaded once
 * for the appointment dialog's optional "Profissional" select.
 */
export function useProfessionals() {
  return useQuery({
    queryKey: professionalKeys.all,
    queryFn: () => getData<Professional[]>("/api/professionals"),
    staleTime: 1000 * 60 * 5,
  });
}
