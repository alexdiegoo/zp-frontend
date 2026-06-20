"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

import { usePatients } from "@/hooks/queries/use-patients";
import { useDebounce } from "@/hooks/ui/use-debounce";
import { PageHeader, Section } from "@/components/shared/layout/page-header";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { patientColumns } from "./_components/columns";
import { CreatePatientDialog } from "./_components/create-patient-dialog";
import { PatientSearch } from "./_components/patient-search";

const PAGE_SIZE = 20;

/** A standalone search term is valid only when empty or ≥ 2 characters. */
const searchTermSchema = z.string().trim().max(120);

export function PatientsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL is the source of truth for what the query fetches (shareable + survives
  // refresh). The input keeps its own immediate state for responsive typing.
  const pageParam = Number(searchParams.get("page"));
  const page = Number.isFinite(pageParam) && pageParam >= 1 ? pageParam : 1;
  const activeQuery = searchParams.get("q") ?? "";

  const [searchInput, setSearchInput] = useState(activeQuery);
  const debouncedSearch = useDebounce(searchInput, 400);

  const trimmed = debouncedSearch.trim();
  const searchError =
    trimmed.length === 1 ? "Digite ao menos 2 caracteres." : null;

  // Push the debounced, validated term into the URL (server-side search, so it
  // spans every page). Resetting to page 1 keeps results consistent.
  const replaceParams = useCallback(
    (next: { page?: number; q?: string }) => {
      const params = new URLSearchParams(searchParams);
      if (next.q !== undefined) {
        if (next.q) params.set("q", next.q);
        else params.delete("q");
      }
      if (next.page !== undefined) {
        if (next.page > 1) params.set("page", String(next.page));
        else params.delete("page");
      }
      router.replace(`${pathname}?${params}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const parsed = searchTermSchema.safeParse(debouncedSearch);
    if (!parsed.success) return;
    const value = parsed.data;
    // Block 1-char queries; let empty through (clears the search).
    if (value.length === 1) return;
    if (value === activeQuery) return;
    replaceParams({ q: value, page: 1 });
  }, [debouncedSearch, activeQuery, replaceParams]);

  const params = useMemo(
    () => ({ page, limit: PAGE_SIZE, q: activeQuery || undefined }),
    [page, activeQuery],
  );
  const { data, isLoading, isError, error, isFetching, refetch } =
    usePatients(params);

  const rows = data?.data ?? [];
  const meta = data?.meta;

  const emptyMessage = activeQuery
    ? `Nenhum paciente encontrado para “${activeQuery}”.`
    : "Nenhum paciente cadastrado ainda.";

  return (
    <Section>
      <PageHeader
        title="Pacientes"
        description="Gerencie os pacientes cadastrados na clínica."
      >
        <CreatePatientDialog />
      </PageHeader>

      <PatientSearch
        value={searchInput}
        onChange={setSearchInput}
        error={searchError}
      />

      {isError ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Não foi possível carregar os pacientes.</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Tente novamente em instantes."}
            <button
              type="button"
              onClick={() => refetch()}
              className="font-medium underline underline-offset-4"
            >
              Tentar novamente
            </button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-col gap-4">
          <DataTable
            columns={patientColumns}
            data={rows}
            isLoading={isLoading}
            emptyMessage={emptyMessage}
            onRowClick={(patient) => router.push(`/patients/${patient.id}`)}
          />
          {meta && meta.total > 0 ? (
            <DataTablePagination
              page={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              pageCount={rows.length}
              limit={meta.limit}
              isFetching={isFetching}
              onPageChange={(next) => replaceParams({ page: next })}
            />
          ) : null}
        </div>
      )}
    </Section>
  );
}
