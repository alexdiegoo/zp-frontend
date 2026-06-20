import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { getData, HttpError, postData } from "@/lib/api/http";
import type { CreateTemplatePayload } from "@/lib/validations/template";
import type {
  SyncTemplatesResponse,
  TemplateDetail,
  TemplatesListResponse,
} from "@/types/api";

/** Params accepted by the template listing query. */
export type TemplatesParams = {
  page: number;
  limit: number;
};

export const templateKeys = {
  all: ["templates"] as const,
  list: (params: TemplatesParams) =>
    [...templateKeys.all, "list", params] as const,
  detail: (id: string) => [...templateKeys.all, "detail", id] as const,
};

/** Paginated listing of the clinic's local WhatsApp message templates. */
export function useTemplates(params: TemplatesParams) {
  const search = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  return useQuery({
    queryKey: templateKeys.list(params),
    queryFn: () => getData<TemplatesListResponse>(`/api/templates?${search}`),
    // Keep the previous page visible while the next loads — avoids table flicker.
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  });
}

/** Full detail of a single template (body, header, buttons, variables). */
export function useTemplate(id: string) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: () => getData<TemplateDetail>(`/api/templates/${id}`),
    staleTime: 1000 * 30,
  });
}

/**
 * Creates a template (draft) and submits it to Meta for approval. On success
 * the listing cache is invalidated so the new `PENDING_REVIEW` row appears.
 */
export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTemplatePayload) =>
      postData<TemplateDetail>(
        "/api/templates",
        payload,
        "Não foi possível criar o template. Tente novamente.",
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: templateKeys.all });
    },
  });
}

/**
 * Syncs templates from Meta (status/content) and refreshes the listing so the
 * updated rows appear. Resolves to `{ syncedCount }` for the success toast.
 */
export function useSyncTemplates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      postData<SyncTemplatesResponse>(
        "/api/templates/sync",
        {},
        "Não foi possível sincronizar os templates. Tente novamente.",
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: templateKeys.all });
    },
  });
}

/**
 * Uploads a header image (PNG/JPEG) and resolves to its hosted URL. Sends a
 * `multipart/form-data` body, so it bypasses the JSON `postData` helper and
 * fetches directly, surfacing a {@link HttpError} on failure like the rest.
 */
export function useUploadHeaderMedia() {
  return useMutation({
    mutationFn: async (file: File): Promise<{ url: string }> => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/templates/upload-header-media", {
        method: "POST",
        body: form,
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const message =
          json && typeof json.error === "string"
            ? json.error
            : "Não foi possível enviar a imagem.";
        throw new HttpError(res.status, message);
      }
      return json.data as { url: string };
    },
  });
}
