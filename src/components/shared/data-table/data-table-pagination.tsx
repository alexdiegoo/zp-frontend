"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

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
  /** Item noun shown in the "X–Y de N" label. Defaults to paciente(s). */
  noun?: { singular: string; plural: string };
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
  noun,
}: DataTablePaginationProps) {
  const t = useTranslations("common");
  const resolvedNoun = noun ?? {
    singular: t("patientSingular"),
    plural: t("patientPlural"),
  };
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = total === 0 ? 0 : from + pageCount - 1;

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <Muted aria-live="polite">
        {total === 0
          ? t("noneOf", { noun: resolvedNoun.singular })
          : t("rangeOf", {
              from,
              to,
              total,
              noun: total === 1 ? resolvedNoun.singular : resolvedNoun.plural,
            })}
      </Muted>

      <div className="flex items-center gap-2">
        <Muted>{t("pageOf", { page, total: Math.max(totalPages, 1) })}</Muted>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={t("previousPage")}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isFetching}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={t("nextPage")}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isFetching}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
