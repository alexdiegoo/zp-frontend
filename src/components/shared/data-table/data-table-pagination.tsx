"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Muted } from "@/components/ui/typography";

interface DataTablePaginationProps {
  page: number;
  totalPages: number;
  total: number;
  /** Rows currently shown on this page (for the "X de Y" label). */
  pageCount: number;
  limit: number;
  onPageChange: (page: number) => void;
  isFetching?: boolean;
}

/** Server-side pagination controls driven by the parent's URL state. */
export function DataTablePagination({
  page,
  totalPages,
  total,
  pageCount,
  limit,
  onPageChange,
  isFetching,
}: DataTablePaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = total === 0 ? 0 : from + pageCount - 1;

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <Muted aria-live="polite">
        {total === 0
          ? "Nenhum paciente"
          : `${from}–${to} de ${total} ${total === 1 ? "paciente" : "pacientes"}`}
      </Muted>

      <div className="flex items-center gap-2">
        <Muted>
          Página {page} de {Math.max(totalPages, 1)}
        </Muted>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Página anterior"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isFetching}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Próxima página"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isFetching}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
