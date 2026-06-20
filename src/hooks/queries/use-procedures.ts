import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { getData, postData } from "@/lib/api/http";
import type { ProcedurePayload } from "@/lib/validations/procedure";
import type {
  Procedure,
  ProcedureDetail,
  ProceduresListResponse,
} from "@/types/api";

/** Params accepted by the procedure listing query. */
export type ProceduresParams = {
  page: number;
  limit: number;
  q?: string;
};

export const procedureKeys = {
  all: ["procedures"] as const,
  list: (params: ProceduresParams) =>
    [...procedureKeys.all, "list", params] as const,
  detail: (id: string) => [...procedureKeys.all, "detail", id] as const,
};

/** Paginated procedure listing with optional text search (`q`). */
export function useProcedures(params: ProceduresParams) {
  const search = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.q) search.set("q", params.q);

  return useQuery({
    queryKey: procedureKeys.list(params),
    queryFn: () => getData<ProceduresListResponse>(`/api/procedures?${search}`),
    // Keep the previous page visible while the next loads — avoids table flicker.
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  });
}

/**
 * Procedure lookup for the appointment dialog's combobox. Always enabled (the
 * dialog shows the first page on open as suggestions) and forwards `q` once it
 * reaches 2 characters. Callers filter out inactive entries client-side via the
 * `isActive` flag.
 */
export function useProcedureSearch(query: string, enabled = true) {
  const trimmed = query.trim();

  const search = new URLSearchParams({ limit: "20" });
  if (trimmed.length >= 2) search.set("q", trimmed);

  return useQuery({
    queryKey: [...procedureKeys.all, "search", trimmed] as const,
    queryFn: () =>
      getData<ProceduresListResponse>(`/api/procedures?${search}`),
    enabled,
    staleTime: 1000 * 60,
  });
}

/** Full detail of a single procedure (catalog entry + price history). */
export function useProcedure(id: string) {
  return useQuery({
    queryKey: procedureKeys.detail(id),
    queryFn: () => getData<ProcedureDetail>(`/api/procedures/${id}`),
    staleTime: 1000 * 30,
  });
}

/** Registers a new procedure, then invalidates every procedure listing. */
export function useCreateProcedure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: ProcedurePayload) =>
      postData<Procedure>(
        "/api/procedures",
        values,
        "Não foi possível cadastrar o procedimento.",
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: procedureKeys.all });
    },
  });
}
