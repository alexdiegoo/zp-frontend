"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, ArrowLeft } from "lucide-react";

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

const priceColumns: ColumnDef<ProcedurePrice, unknown>[] = [
  {
    accessorKey: "amount",
    header: "Valor",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums text-foreground">
        {formatCurrency(row.original.amount)}
      </span>
    ),
  },
  {
    accessorKey: "effectiveFrom",
    header: "Vigente desde",
    cell: ({ row }) => (
      <span className="tabular-nums text-muted-foreground">
        {formatDate(row.original.effectiveFrom)}
      </span>
    ),
  },
  {
    accessorKey: "effectiveTo",
    header: "Vigente até",
    cell: ({ row }) => (
      <span className="tabular-nums text-muted-foreground">
        {row.original.effectiveTo ? formatDate(row.original.effectiveTo) : "—"}
      </span>
    ),
  },
  {
    accessorKey: "isCurrent",
    header: "Situação",
    cell: ({ row }) =>
      row.original.isCurrent ? (
        <Badge variant="secondary">Vigente</Badge>
      ) : (
        <Badge variant="outline">Histórico</Badge>
      ),
  },
];

function BackLink() {
  return (
    <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
      <Link href="/procedures">
        <ArrowLeft />
        Procedimentos
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
  const {
    data: procedure,
    isLoading,
    isError,
    error,
  } = useProcedure(procedureId);

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
          <AlertTitle>Não foi possível carregar o procedimento.</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "O procedimento não foi encontrado ou ocorreu um erro."}
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
        description={`Cadastrado em ${formatDate(procedure.createdAt)}`}
      >
        {procedure.isActive ? (
          <Badge variant="secondary">Ativo</Badge>
        ) : (
          <Badge variant="outline">Inativo</Badge>
        )}
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Dados do procedimento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field label="Valor base" value={formatCurrency(procedure.basePrice)} />
          <Field
            label="Valor atual"
            value={formatCurrency(procedure.currentPrice)}
          />
          <Field label="Status" value={procedure.isActive ? "Ativo" : "Inativo"} />
          <div className="space-y-1 sm:col-span-2">
            <Label>Descrição</Label>
            <P>{procedure.description || "—"}</P>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <H3>Histórico de preços</H3>
        {priceHistory.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center">
            <Muted>Este procedimento ainda não possui histórico de preços.</Muted>
          </div>
        ) : (
          <DataTable columns={priceColumns} data={priceHistory} />
        )}
      </div>
    </Section>
  );
}
