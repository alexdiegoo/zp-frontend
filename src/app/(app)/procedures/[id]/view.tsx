"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import { useProcedure } from "@/hooks/queries/use-procedures";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ProcedurePrice } from "@/types/api";
import { PageHeader, Section } from "@/components/shared/layout/page-header";
import { DataTable } from "@/components/shared/data-table/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { H3, Label, Muted, P } from "@/components/ui/typography";

type Translator = ReturnType<typeof useTranslations<"procedures">>;

function getPriceColumns(
  t: Translator,
): ColumnDef<ProcedurePrice, unknown>[] {
  return [
    {
      accessorKey: "amount",
      header: t("priceColumns.amount"),
      cell: ({ row }) => (
        <span className="font-medium tabular-nums text-foreground">
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: "effectiveFrom",
      header: t("priceColumns.effectiveFrom"),
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {formatDate(row.original.effectiveFrom)}
        </span>
      ),
    },
    {
      accessorKey: "effectiveTo",
      header: t("priceColumns.effectiveTo"),
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original.effectiveTo ? formatDate(row.original.effectiveTo) : "—"}
        </span>
      ),
    },
    {
      accessorKey: "isCurrent",
      header: t("priceColumns.status"),
      cell: ({ row }) =>
        row.original.isCurrent ? (
          <Badge variant="secondary">{t("status.current")}</Badge>
        ) : (
          <Badge variant="outline">{t("status.historical")}</Badge>
        ),
    },
  ];
}

function BackLink() {
  const t = useTranslations("procedures");
  return (
    <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
      <Link href="/procedures">
        <ArrowLeft />
        {t("title")}
      </Link>
    </Button>
  );
}

/** A labelled field in the detail card. */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <P>{value}</P>
    </div>
  );
}

export function ProcedureDetailView({
  procedureId,
}: {
  procedureId: string;
}) {
  const t = useTranslations("procedures");
  const {
    data: procedure,
    isLoading,
    isError,
    error,
  } = useProcedure(procedureId);

  const priceColumns = useMemo(() => getPriceColumns(t), [t]);

  if (isLoading) {
    return (
      <Section>
        <BackLink />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40" />
        <Skeleton className="h-48" />
      </Section>
    );
  }

  if (isError || !procedure) {
    return (
      <Section>
        <BackLink />
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>{t("error.detailTitle")}</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : t("error.detailDescription")}
          </AlertDescription>
        </Alert>
      </Section>
    );
  }

  const { priceHistory } = procedure;

  return (
    <Section>
      <BackLink />

      <PageHeader
        title={procedure.name}
        description={t("registeredOn", {
          date: formatDate(procedure.createdAt),
        })}
      >
        {procedure.isActive ? (
          <Badge variant="secondary">{t("status.active")}</Badge>
        ) : (
          <Badge variant="outline">{t("status.inactive")}</Badge>
        )}
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>{t("detail.cardTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field
            label={t("fields.basePrice.label")}
            value={formatCurrency(procedure.basePrice)}
          />
          <Field
            label={t("fields.currentPrice.label")}
            value={formatCurrency(procedure.currentPrice)}
          />
          <Field
            label={t("fields.status.label")}
            value={procedure.isActive ? t("status.active") : t("status.inactive")}
          />
          <div className="space-y-1 sm:col-span-2">
            <Label>{t("fields.description.label")}</Label>
            <P>{procedure.description || "—"}</P>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <H3>{t("detail.priceHistory")}</H3>
        {priceHistory.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center">
            <Muted>{t("detail.priceHistoryEmpty")}</Muted>
          </div>
        ) : (
          <DataTable columns={priceColumns} data={priceHistory} />
        )}
      </div>
    </Section>
  );
}
