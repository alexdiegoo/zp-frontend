"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
} from "@tanstack/react-table";

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
}

/**
 * Shared TanStack Table base. Pagination/sorting/filtering are owned externally
 * (driven by URL params), so this renders the already-prepared page of `data`
 * via the core row model only.
 */
export function DataTable<TData>({
  columns,
  data,
  isLoading,
  emptyMessage = "Nenhum resultado encontrado.",
  onRowClick,
}: DataTableProps<TData>) {
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

  const handleRowKeyDown =
    (row: Row<TData>) => (event: React.KeyboardEvent<HTMLTableRowElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onRowClick?.(row.original);
      }
    };

  return (
    <div className="rounded-xl border border-border bg-card">
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
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
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
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
