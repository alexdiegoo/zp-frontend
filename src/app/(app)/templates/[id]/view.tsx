"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { useTemplate } from "@/hooks/queries/use-templates";
import { formatDate } from "@/lib/format";
import {
  formatTemplateLanguage,
  templateCategoryLabel,
  templateStatusLabel,
  templateStatusVariant,
} from "@/lib/template-display";
import { PageHeader, Section } from "@/components/shared/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { H3, Label, Muted, P } from "@/components/ui/typography";
import { TemplateMessagePreview } from "@/components/shared/template/template-message-preview";
import { AiFeedbackSection } from "./_components/ai-feedback-section";

function BackLink() {
  const t = useTranslations("templates");
  return (
    <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
      <Link href="/templates">
        <ArrowLeft />
        {t("backToList")}
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

export function TemplateDetailView({ templateId }: { templateId: string }) {
  const t = useTranslations("templates");
  const { data: template, isLoading, isError, error } = useTemplate(templateId);

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

  if (isError || !template) {
    return (
      <Section>
        <BackLink />
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>{t("error.load.title")}</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : t("error.load.description")}
          </AlertDescription>
        </Alert>
      </Section>
    );
  }

  const { buttons, variableMapping } = template;
  const headerLabel =
    template.headerType === "TEXT"
      ? t("detail.header.text")
      : template.headerType === "IMAGE"
        ? t("detail.header.image")
        : template.headerType === "VIDEO"
          ? t("detail.header.video")
          : template.headerType === "DOCUMENT"
            ? t("detail.header.document")
            : t("detail.header.none");

  return (
    <Section>
      <BackLink />

      <PageHeader
        title={template.name}
        description={t("createdOn", { date: formatDate(template.createdAt) })}
      >
        <Badge variant={templateStatusVariant(template.status)}>
          {templateStatusLabel(template.status)}
        </Badge>
      </PageHeader>

      <div className="grid items-start gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-6 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.dataCard")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <Field
                label={t("detail.fields.category")}
                value={templateCategoryLabel(template.category)}
              />
              <Field
                label={t("detail.fields.language")}
                value={formatTemplateLanguage(template.language)}
              />
              <Field
                label={t("detail.fields.status")}
                value={templateStatusLabel(template.status)}
              />
              <Field label={t("detail.fields.header")} value={headerLabel} />
              {template.headerType === "TEXT" && template.headerText ? (
                <div className="space-y-1 sm:col-span-2">
                  <Label>{t("detail.fields.headerText")}</Label>
                  <P>{template.headerText}</P>
                </div>
              ) : null}
              {template.metaTemplateId ? (
                <Field
                  label={t("detail.fields.metaId")}
                  value={template.metaTemplateId}
                />
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("detail.contentCard")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1">
                <Label>{t("detail.fields.body")}</Label>
                {template.bodyPreview || template.bodyText ? (
                  <P className="whitespace-pre-wrap">
                    {template.bodyPreview ?? template.bodyText}
                  </P>
                ) : (
                  <Muted>{t("detail.noBody")}</Muted>
                )}
              </div>

              {template.footer ? (
                <div className="space-y-1">
                  <Label>{t("detail.fields.footer")}</Label>
                  <P className="text-muted-foreground">{template.footer}</P>
                </div>
              ) : null}

              {buttons && buttons.length > 0 ? (
                <div className="space-y-2">
                  <Label>{t("detail.fields.buttons")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {buttons.map((button, index) => (
                      <Badge key={`${button.text}-${index}`} variant="outline">
                        {button.text}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <H3>{t("detail.variables.title")}</H3>
            {variableMapping.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center">
                <Muted>{t("detail.variables.none")}</Muted>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {variableMapping.map((variable) => {
                  const example = template.variableExamples[variable.name];
                  return (
                    <Badge key={variable.name} variant="secondary">
                      {`{{${variable.name}}}`}
                      {example ? ` · ${example}` : ""}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex flex-col gap-6 lg:sticky lg:top-6">
            <AiFeedbackSection templateId={templateId} />

            <Card>
              <CardHeader>
                <CardTitle>{t("preview.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <TemplateMessagePreview
                  headerType={template.headerType}
                  headerText={template.headerText}
                  headerMediaUrl={template.headerMediaUrl}
                  bodyText={template.bodyText ?? template.bodyPreview}
                  variableExamples={template.variableExamples}
                  footer={template.footer}
                  buttons={template.buttons}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Section>
  );
}
