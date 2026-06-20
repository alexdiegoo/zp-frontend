"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { formatCurrency, formatDate } from "@/lib/format";
import type { Procedure } from "@/types/api";
import { Badge } from "@/components/ui/badge";

export const procedureColumns: ColumnDef<Procedure, unknown>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "basePrice",
    header: "Valor base",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatCurrency(row.original.basePrice)}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) =>
      row.original.isActive ? (
        <Badge variant="secondary">Ativo</Badge>
      ) : (
        <Badge variant="outline">Inativo</Badge>
      ),
  },
  {
    accessorKey: "createdAt",
    header: "Cadastro",
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
];
