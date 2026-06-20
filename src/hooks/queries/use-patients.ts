import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { getData, postData } from "@/lib/api/http";
import type { CreatePatientDto } from "@/lib/validations/patient";
import type {
  Patient,
  PatientDetail,
  PatientsListResponse,
} from "@/types/api";

/** Params accepted by the patient listing query. */
export type PatientsParams = {
  page: number;
  limit: number;
  q?: string;
};

export const patientKeys = {
  all: ["patients"] as const,
  list: (params: PatientsParams) =>
    [...patientKeys.all, "list", params] as const,
  detail: (id: string) => [...patientKeys.all, "detail", id] as const,
};

/** Paginated patient listing with optional text search (`q`). */
export function usePatients(params: PatientsParams) {
  const search = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.q) search.set("q", params.q);

  return useQuery({
    queryKey: patientKeys.list(params),
    queryFn: () => getData<PatientsListResponse>(`/api/patients?${search}`),
    // Keep the previous page visible while the next loads — avoids table flicker.
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  });
}

/**
 * Lightweight patient lookup for the appointment dialog's combobox. Disabled
 * until the (trimmed) query reaches 2 characters so we never fire a request for
 * a single keystroke; its cache key is separate from the table listing.
 */
export function usePatientSearch(query: string) {
  const trimmed = query.trim();
  const enabled = trimmed.length >= 2;

  const search = new URLSearchParams({ limit: "20" });
  if (enabled) search.set("q", trimmed);

  return useQuery({
    queryKey: [...patientKeys.all, "search", trimmed] as const,
    queryFn: () => getData<PatientsListResponse>(`/api/patients?${search}`),
    enabled,
    staleTime: 1000 * 30,
  });
}

/** Full profile of a single patient (history + stats). */
export function usePatient(id: string) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => getData<PatientDetail>(`/api/patients/${id}`),
    staleTime: 1000 * 30,
  });
}

/** Registers a new patient, then invalidates every patient listing. */
export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: CreatePatientDto) =>
      postData<Patient>(
        "/api/patients",
        values,
        "Não foi possível cadastrar o paciente.",
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientKeys.all });
    },
  });
}
