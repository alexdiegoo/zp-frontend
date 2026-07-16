"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { useTranslations } from "next-intl";

import { formatCurrency, formatDate } from "@/lib/format";
import type { Procedure } from "@/types/api";
import { Badge } from "@/components/ui/badge";

type Translator = ReturnType<typeof useTranslations<"procedures">>;

export function getProcedureColumns(
  t: Translator,
): ColumnDef<Procedure, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: t("columns.name"),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "basePrice",
      header: t("columns.basePrice"),
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatCurrency(row.original.basePrice)}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: t("columns.status"),
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge variant="secondary">{t("status.active")}</Badge>
        ) : (
          <Badge variant="outline">{t("status.inactive")}</Badge>
        ),
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
