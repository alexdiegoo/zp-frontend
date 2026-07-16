"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { useTranslations } from "next-intl";

import { formatDate, formatPhone } from "@/lib/format";
import type { Patient } from "@/types/api";

type Translator = ReturnType<typeof useTranslations<"leads">>;

export function getPatientColumns(t: Translator): ColumnDef<Patient, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: t("columns.name"),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "whatsappNumber",
      header: t("columns.phone"),
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatPhone(row.original.whatsappNumber)}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: t("columns.email"),
      cell: ({ row }) => row.original.email || "—",
    },
    {
      accessorKey: "createdAt",
      header: t("columns.createdAt"),
      cell: ({ row }) => (
        <span className="text-muted-foreground tabular-nums">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
  ];
}
