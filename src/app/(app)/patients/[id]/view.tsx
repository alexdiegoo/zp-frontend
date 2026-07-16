"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

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

type Translator = ReturnType<typeof useTranslations<"leads">>;

function getServiceColumns(
  t: Translator,
): ColumnDef<PatientServiceEntry, unknown>[] {
  return [
    {
      accessorKey: "performedAt",
      header: t("serviceColumns.date"),
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
      header: t("serviceColumns.procedure"),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.procedure?.name ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "professional",
      header: t("serviceColumns.professional"),
      cell: ({ row }) => row.original.professional?.name ?? "—",
    },
    {
      accessorKey: "priceCharged",
      header: t("serviceColumns.amount"),
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatCurrency(row.original.priceCharged)}
        </span>
      ),
    },
  ];
}

function BackLink() {
  const t = useTranslations("leads");
  return (
    <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
      <Link href="/patients">
        <ArrowLeft />
        {t("title")}
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
  const t = useTranslations("leads");
  const { data: patient, isLoading, isError, error } = usePatient(patientId);
  const serviceColumns = useMemo(() => getServiceColumns(t), [t]);

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
          <AlertTitle>{t("error.loadPatient")}</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : t("error.patientNotFound")}
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
        description={t("detail.registeredOn", {
          date: formatDate(patient.createdAt),
        })}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label={t("detail.stats.appointments")}
          value={String(stats.totalAppointments)}
        />
        <Stat
          label={t("detail.stats.lastAppointment")}
          value={formatDate(stats.lastAppointment)}
        />
        <Stat
          label={t("detail.stats.ltv")}
          value={formatCurrency(stats.lifetimeValue)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("detail.dataTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field
            label={t("fields.whatsapp")}
            value={formatPhone(patient.whatsappNumber)}
          />
          <Field label={t("fields.email")} value={patient.email || "—"} />
          <Field
            label={t("detail.fields.birth")}
            value={patient.birthDate ? formatDate(patient.birthDate) : "—"}
          />
          <Field
            label={t("fields.source")}
            value={patient.acquisitionSource || "—"}
          />
          <Field label={t("fields.address")} value={patient.address || "—"} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <H3>{t("detail.history.title")}</H3>
        {serviceHistory.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center">
            <Muted>{t("detail.history.empty")}</Muted>
          </div>
        ) : (
          <DataTable columns={serviceColumns} data={serviceHistory} />
        )}
      </div>
    </Section>
  );
}
