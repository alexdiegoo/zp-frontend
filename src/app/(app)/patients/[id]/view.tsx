"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { usePatient } from "@/hooks/queries/use-patients";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPhone,
} from "@/lib/format";
import type { PatientServiceEntry } from "@/types/api";
import { PageHeader, Section } from "@/components/shared/layout/page-header";
import { DataTable } from "@/components/shared/data-table/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { H3, Label, Muted, P } from "@/components/ui/typography";

const serviceColumns: ColumnDef<PatientServiceEntry, unknown>[] = [
  {
    accessorKey: "performedAt",
    header: "Data",
    cell: ({ row }) => (
      <span className="tabular-nums text-muted-foreground">
        {formatDateTime(
          row.original.performedAt ?? row.original.appointment?.startAt,
        )}
      </span>
    ),
  },
  {
    accessorKey: "procedure",
    header: "Procedimento",
    cell: ({ row }) => (
      <span className="font-medium text-foreground">
        {row.original.procedure?.name ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "professional",
    header: "Profissional",
    cell: ({ row }) => row.original.professional?.name ?? "—",
  },
  {
    accessorKey: "priceCharged",
    header: "Valor",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatCurrency(row.original.priceCharged)}
      </span>
    ),
  },
];

function BackLink() {
  return (
    <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
      <Link href="/patients">
        <ArrowLeft />
        Pacientes
      </Link>
    </Button>
  );
}

/** A labelled field in the profile card. */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <P>{value}</P>
    </div>
  );
}

/** A single stat tile. */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export function PatientDetailView({ patientId }: { patientId: string }) {
  const { data: patient, isLoading, isError, error } = usePatient(patientId);

  if (isLoading) {
    return (
      <Section>
        <BackLink />
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-48" />
      </Section>
    );
  }

  if (isError || !patient) {
    return (
      <Section>
        <BackLink />
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Não foi possível carregar o paciente.</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "O paciente não foi encontrado ou ocorreu um erro."}
          </AlertDescription>
        </Alert>
      </Section>
    );
  }

  const { stats, serviceHistory } = patient;

  return (
    <Section>
      <BackLink />

      <PageHeader
        title={patient.name}
        description={`Cadastrado em ${formatDate(patient.createdAt)}`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Atendimentos" value={String(stats.totalAppointments)} />
        <Stat
          label="Último atendimento"
          value={formatDate(stats.lastAppointment)}
        />
        <Stat label="LTV" value={formatCurrency(stats.lifetimeValue)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do paciente</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field label="WhatsApp" value={formatPhone(patient.whatsappNumber)} />
          <Field label="E-mail" value={patient.email || "—"} />
          <Field
            label="Nascimento"
            value={patient.birthDate ? formatDate(patient.birthDate) : "—"}
          />
          <Field label="Origem" value={patient.acquisitionSource || "—"} />
          <Field label="Endereço" value={patient.address || "—"} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <H3>Histórico de atendimentos</H3>
        {serviceHistory.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center">
            <Muted>Este paciente ainda não possui atendimentos.</Muted>
          </div>
        ) : (
          <DataTable columns={serviceColumns} data={serviceHistory} />
        )}
      </div>
    </Section>
  );
}
