"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";

import { formatDate } from "@/lib/format";
import {
  aiFeedbackStatusLabel,
  aiFeedbackStatusVariant,
  formatTemplateLanguage,
  templateCategoryLabel,
  templateStatusLabel,
  templateStatusVariant,
} from "@/lib/template-display";
import type { Template } from "@/types/api";
import { Badge } from "@/components/ui/badge";

type Translator = ReturnType<typeof useTranslations<"templates">>;

export function getTemplateColumns(
  t: Translator,
): ColumnDef<Template, unknown>[] {
  return [
  {
    accessorKey: "name",
    header: t("columns.name"),
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "category",
    header: t("columns.category"),
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {templateCategoryLabel(row.original.category)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: t("columns.status"),
    cell: ({ row }) => (
      <Badge variant={templateStatusVariant(row.original.status)}>
        {templateStatusLabel(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: "aiFeedbackStatus",
    header: t("columns.aiFeedback"),
    cell: ({ row }) => {
      const status = row.original.aiFeedbackStatus;
      if (!status) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <Badge variant={aiFeedbackStatusVariant(status)}>
          <Sparkles />
          {aiFeedbackStatusLabel(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "language",
    header: t("columns.language"),
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatTemplateLanguage(row.original.language)}
      </span>
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
