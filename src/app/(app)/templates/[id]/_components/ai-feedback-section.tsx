"use client";

import type { VariantProps } from "class-variance-authority";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AlertCircle, Pencil, Sparkles } from "lucide-react";

import { useTemplateAiFeedback } from "@/hooks/queries/use-templates";
import { formatDateTime } from "@/lib/format";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label, Muted, P } from "@/components/ui/typography";
import type { AiFeedbackSeverity } from "@/types/api";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

const SEVERITY_VARIANTS: Record<AiFeedbackSeverity, BadgeVariant> = {
  alerta: "secondary",
  bloqueante: "destructive",
};

/** Card title shared across every state of the section. */
function FeedbackTitle() {
  const t = useTranslations("templates");
  return (
    <CardTitle className="flex items-center gap-2">
      <Sparkles className="size-4 text-primary" />
      {t("aiFeedback.title")}
    </CardTitle>
  );
}

/**
 * Shows the latest AI validation run for a template: overall status, the AI's
 * summary and the list of flagged issues. Renders its own loading/error/empty
 * states so it can be dropped into the detail view independently of the
 * template fetch.
 */
export function AiFeedbackSection({ templateId }: { templateId: string }) {
  const t = useTranslations("templates");
  const { data: feedback, isLoading, isError } = useTemplateAiFeedback(templateId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <FeedbackTitle />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-16" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <FeedbackTitle />
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>{t("aiFeedback.error.title")}</AlertTitle>
            <AlertDescription>
              {t("aiFeedback.error.description")}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // No validation run yet for this template.
  if (!feedback) {
    return (
      <Card>
        <CardHeader>
          <FeedbackTitle />
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center">
            <Muted>{t("aiFeedback.empty")}</Muted>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isProcessing = feedback.status === "PROCESSING";

  return (
    <Card>
      <CardHeader>
        <FeedbackTitle />
      </CardHeader>

      <CardContent className="space-y-5">
        {isProcessing ? (
          <Muted>{t("aiFeedback.processing")}</Muted>
        ) : null}

        {feedback.summary ? (
          <div className="space-y-1">
            <Label>{t("aiFeedback.summary")}</Label>
            <P className="whitespace-pre-wrap">{feedback.summary}</P>
          </div>
        ) : null}

        <div className="space-y-3">
          <Label>{t("aiFeedback.issues")}</Label>
          {feedback.issues.length === 0 ? (
            <Muted>{t("aiFeedback.noIssues")}</Muted>
          ) : (
            <ul className="space-y-3">
              {feedback.issues.map((issue, index) => (
                <li
                  key={`${issue.campo}-${index}`}
                  className="space-y-2 rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label className="normal-case tracking-normal">
                      {issue.campo || t("aiFeedback.general")}
                    </Label>
                    <Badge variant={SEVERITY_VARIANTS[issue.severidade]}>
                      {issue.severidade === "bloqueante"
                        ? t("aiFeedback.severity.bloqueante")
                        : t("aiFeedback.severity.alerta")}
                    </Badge>
                  </div>
                  <P>{issue.descricao}</P>
                  {issue.sugestao ? (
                    <div className="space-y-1">
                      <Label>{t("aiFeedback.suggestion")}</Label>
                      <Muted>{issue.sugestao}</Muted>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button asChild className="w-full">
          <Link href={`/templates/${templateId}/edit`}>
            <Pencil />
            {t("aiFeedback.edit")}
          </Link>
        </Button>

        <Muted>
          {t("aiFeedback.analyzedOn", {
            date: formatDateTime(feedback.createdAt),
          })}
        </Muted>
      </CardContent>
    </Card>
  );
}
