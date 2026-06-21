"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
  formatTemplateLanguage,
  templateCategoryLabel,
  templateStatusLabel,
  templateStatusVariant,
} from "@/lib/template-display";
import { TemplateMessagePreview } from "@/components/shared/template/template-message-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label, Muted, P } from "@/components/ui/typography";
import type { TemplateDetail } from "@/types/api";

/** A labelled field in the template detail card. */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <P>{value}</P>
    </div>
  );
}

const HEADER_LABELS: Record<string, string> = {
  TEXT: "Texto",
  IMAGE: "Imagem",
  VIDEO: "Vídeo",
  DOCUMENT: "Documento",
};

/**
 * Official-campaign template panel: the approved template the campaign sends.
 * Shows the template's data and a live preview, plus a link to the full template
 * page. Renders an empty state when the template can't be resolved.
 */
export function CampaignTemplateCard({
  template,
}: {
  template: TemplateDetail | null;
}) {
  if (!template) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Template</CardTitle>
        </CardHeader>
        <CardContent>
          <Muted>
            Não foi possível carregar o template desta campanha.
          </Muted>
        </CardContent>
      </Card>
    );
  }

  const headerLabel = HEADER_LABELS[template.headerType] ?? "Nenhum";

  return (
    <div className="grid items-start gap-6 lg:grid-cols-5">
      <div className="flex flex-col gap-6 lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Template</CardTitle>
            <CardAction className="flex items-center gap-2">
              <Badge variant={templateStatusVariant(template.status)}>
                {templateStatusLabel(template.status)}
              </Badge>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/templates/${template.id}`}>
                  Abrir
                  <ArrowUpRight />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <Field label="Nome" value={template.name} />
            <Field
              label="Categoria"
              value={templateCategoryLabel(template.category)}
            />
            <Field
              label="Idioma"
              value={formatTemplateLanguage(template.language)}
            />
            <Field label="Cabeçalho" value={headerLabel} />
            <div className="space-y-1 sm:col-span-2">
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
              <div className="space-y-1 sm:col-span-2">
                <Label>Rodapé</Label>
                <P className="text-muted-foreground">{template.footer}</P>
              </div>
            ) : null}
            {template.buttons && template.buttons.length > 0 ? (
              <div className="space-y-2 sm:col-span-2">
                <Label>Botões</Label>
                <div className="flex flex-wrap gap-2">
                  {template.buttons.map((button, index) => (
                    <Badge key={`${button.text}-${index}`} variant="outline">
                      {button.text}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="lg:sticky lg:top-6">
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
  );
}
