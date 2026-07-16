"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableSkeleton } from "./data-table-skeleton";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
  /** Invoked when a row is clicked; also makes rows keyboard-activatable. */
  onRowClick?: (row: TData) => void;
  /**
   * Mobile presentation (<md). Default `"cards"` renders each row as a labeled
   * card. Use `"scroll"` only for genuinely wide tables where a card layout is
   * impractical — the table then scrolls horizontally inside its own region.
   */
  mobileLayout?: "cards" | "scroll";
}

/**
 * Shared TanStack Table base. Pagination/sorting/filtering are owned externally
 * (driven by URL params), so this renders the already-prepared page of `data`
 * via the core row model only.
 *
 * Mobile-first: below `md` each row renders as a labeled card by default so no
 * data is lost and the page never scrolls horizontally; at `md`+ the standard
 * table renders inside a contained horizontal-scroll region.
 */
export function DataTable<TData>({
  columns,
  data,
  isLoading,
  emptyMessage,
  onRowClick,
  mobileLayout = "cards",
}: DataTableProps<TData>) {
  const t = useTranslations("common");
  const resolvedEmptyMessage = emptyMessage ?? t("noResults");
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card">
        <DataTableSkeleton columns={columns.length} />
      </div>
    );
  }

  const rows = table.getRowModel().rows;

  const handleRowKeyDown =
    (row: Row<TData>) => (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onRowClick?.(row.original);
      }
    };

  // Map each leaf column to its rendered header, used as the label in the
  // mobile card layout.
  const leafHeaders = table.getHeaderGroups().at(-1)?.headers ?? [];
  const headerLabelById = new Map(
    leafHeaders.map((header) => [
      header.column.id,
      header.isPlaceholder
        ? null
        : flexRender(header.column.columnDef.header, header.getContext()),
    ]),
  );

  const tableView = (
    <div className={cn(mobileLayout === "cards" ? "hidden md:block" : "overflow-x-auto")}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="hover:bg-transparent">
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                onKeyDown={onRowClick ? handleRowKeyDown(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? "link" : undefined}
                className={cn(
                  onRowClick &&
                    "cursor-pointer focus-visible:bg-muted focus-visible:outline-none",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {resolvedEmptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  // Card layout for small screens (default). Each row becomes a stacked list of
  // label/value pairs so no column is truncated and the page never scrolls
  // horizontally.
  const cardsView =
    mobileLayout === "cards" ? (
      <div className="divide-y divide-border md:hidden">
        {rows.length ? (
          rows.map((row) => (
            <div
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              onKeyDown={onRowClick ? handleRowKeyDown(row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? "link" : undefined}
              className={cn(
                "flex flex-col gap-2 p-4",
                onRowClick &&
                  "cursor-pointer focus-visible:bg-muted focus-visible:outline-none",
              )}
            >
              {row.getVisibleCells().map((cell) => {
                const label = headerLabelById.get(cell.column.id);
                return (
                  <div
                    key={cell.id}
                    className="flex items-start justify-between gap-3"
                  >
                    {label ? (
                      <span className="shrink-0 text-xs font-medium text-muted-foreground">
                        {label}
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        "min-w-0 text-sm",
                        label ? "text-right" : "flex-1",
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </span>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </div>
    ) : null;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {cardsView}
      {tableView}
    </div>
  );
}
