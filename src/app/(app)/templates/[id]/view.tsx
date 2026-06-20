"use client";

import Link from "next/link";
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

function BackLink() {
  return (
    <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
      <Link href="/templates">
        <ArrowLeft />
        Templates
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
          <AlertTitle>Não foi possível carregar o template.</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "O template não foi encontrado ou ocorreu um erro."}
          </AlertDescription>
        </Alert>
      </Section>
    );
  }

  const { buttons, variableMapping } = template;
  const headerLabel =
    template.headerType === "TEXT"
      ? "Texto"
      : template.headerType === "IMAGE"
        ? "Imagem"
        : template.headerType === "VIDEO"
          ? "Vídeo"
          : template.headerType === "DOCUMENT"
            ? "Documento"
            : "Nenhum";

  return (
    <Section>
      <BackLink />

      <PageHeader
        title={template.name}
        description={`Criado em ${formatDate(template.createdAt)}`}
      >
        <Badge variant={templateStatusVariant(template.status)}>
          {templateStatusLabel(template.status)}
        </Badge>
      </PageHeader>

      <div className="grid items-start gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-6 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Dados do template</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Categoria"
                value={templateCategoryLabel(template.category)}
              />
              <Field
                label="Idioma"
                value={formatTemplateLanguage(template.language)}
              />
              <Field
                label="Status"
                value={templateStatusLabel(template.status)}
              />
              <Field label="Cabeçalho" value={headerLabel} />
              {template.headerType === "TEXT" && template.headerText ? (
                <div className="space-y-1 sm:col-span-2">
                  <Label>Texto do cabeçalho</Label>
                  <P>{template.headerText}</P>
                </div>
              ) : null}
              {template.metaTemplateId ? (
                <Field label="ID na Meta" value={template.metaTemplateId} />
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conteúdo da mensagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1">
                <Label>Corpo</Label>
                {template.bodyPreview || template.bodyText ? (
                  <P className="whitespace-pre-wrap">
                    {template.bodyPreview ?? template.bodyText}
                  </P>
                ) : (
                  <Muted>Sem corpo definido.</Muted>
                )}
              </div>

              {template.footer ? (
                <div className="space-y-1">
                  <Label>Rodapé</Label>
                  <P className="text-muted-foreground">{template.footer}</P>
                </div>
              ) : null}

              {buttons && buttons.length > 0 ? (
                <div className="space-y-2">
                  <Label>Botões</Label>
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
            <H3>Variáveis</H3>
            {variableMapping.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center">
                <Muted>Este template não possui variáveis.</Muted>
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
          <div className="lg:sticky lg:top-6">
            <Card>
              <CardHeader>
                <CardTitle>Pré-visualização</CardTitle>
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
