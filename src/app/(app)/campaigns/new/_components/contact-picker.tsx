"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Muted } from "@/components/ui/typography";
import { usePatients } from "@/hooks/queries/use-patients";
import { useDebounce } from "@/hooks/ui/use-debounce";
import { cn } from "@/lib/utils";
import { formatPhone } from "@/lib/format";

const PAGE_SIZE = 8;

interface ContactPickerProps {
  /** Currently selected patient ids (selection persists across pages/searches). */
  value: string[];
  onChange: (ids: string[]) => void;
  error?: string | null;
}

/**
 * Searchable, paginated contact list with multi-select. Selection is held by the
 * parent (the form field) as a flat id list and persists across pages because the
 * checkbox state is derived from that set, not from the current page's rows.
 */
export function ContactPicker({ value, onChange, error }: ContactPickerProps) {
  const t = useTranslations("campaigns");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const trimmed = debouncedSearch.trim();

  const { data, isLoading, isFetching } = usePatients({
    page,
    limit: PAGE_SIZE,
    q: trimmed.length >= 2 ? trimmed : undefined,
  });

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const selected = useMemo(() => new Set(value), [value]);

  const pageIds = rows.map((row) => row.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };

  const toggleAllOnPage = () => {
    const next = new Set(selected);
    if (allPageSelected) {
      pageIds.forEach((id) => next.delete(id));
    } else {
      pageIds.forEach((id) => next.add(id));
    }
    onChange([...next]);
  };

  // Reset to the first page whenever the (debounced) search term changes.
  const onSearchChange = (next: string) => {
    setSearchInput(next);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("contactPicker.searchPlaceholder")}
          aria-label={t("contactPicker.searchAria")}
          className="px-8"
        />
        {searchInput ? (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label={t("clearSearch")}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <div
        className={cn(
          "rounded-xl border border-border bg-card",
          error && "border-destructive",
        )}
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    allPageSelected
                      ? true
                      : somePageSelected
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={toggleAllOnPage}
                  disabled={pageIds.length === 0}
                  aria-label={t("contactPicker.selectAll")}
                />
              </TableHead>
              <TableHead>{t("contactPicker.columns.name")}</TableHead>
              <TableHead>{t("contactPicker.columns.phone")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  {t("contactPicker.loading")}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  {trimmed
                    ? t("contactPicker.emptySearch", { query: trimmed })
                    : t("contactPicker.empty")}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((contact) => {
                const isSelected = selected.has(contact.id);
                return (
                  <TableRow
                    key={contact.id}
                    data-state={isSelected ? "selected" : undefined}
                    className="cursor-pointer"
                    onClick={() => toggleOne(contact.id)}
                  >
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(contact.id)}
                        aria-label={t("contactPicker.selectOne", { name: contact.name })}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {contact.name}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatPhone(contact.whatsappNumber)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <Muted aria-live="polite">
          {t("contactPicker.selectedCount", { count: value.length })}
        </Muted>
        {meta && meta.total > 0 ? (
          <div className="flex items-center gap-2">
            <Muted>
              {t("contactPicker.pageOf", {
                page: meta.page,
                total: Math.max(meta.totalPages, 1),
              })}
            </Muted>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={t("contactPicker.prevPage")}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || isFetching}
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={t("contactPicker.nextPage")}
              onClick={() => setPage((current) => current + 1)}
              disabled={page >= meta.totalPages || isFetching}
            >
              <ChevronRight />
            </Button>
          </div>
        ) : null}
      </div>

      {error ? <p className="text-[13px] text-destructive">{error}</p> : null}
    </div>
  );
}
