"use client";

import type { ColumnDef } from "@tanstack/react-table";
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

export const templateColumns: ColumnDef<Template, unknown>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {templateCategoryLabel(row.original.category)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={templateStatusVariant(row.original.status)}>
        {templateStatusLabel(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: "aiFeedbackStatus",
    header: "Feedback IA",
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
    header: "Idioma",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatTemplateLanguage(row.original.language)}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Data de criação",
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
];
