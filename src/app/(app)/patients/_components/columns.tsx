"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { formatDate, formatPhone } from "@/lib/format";
import type { Patient } from "@/types/api";

export const patientColumns: ColumnDef<Patient, unknown>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "whatsappNumber",
    header: "Telefone",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatPhone(row.original.whatsappNumber)}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: "E-mail",
    cell: ({ row }) => row.original.email || "—",
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
