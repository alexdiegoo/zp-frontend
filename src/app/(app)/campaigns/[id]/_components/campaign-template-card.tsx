"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
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

type CampaignsT = ReturnType<typeof useTranslations<"campaigns">>;

/** Resolves the header-type label via literal keys so they stay type-checked. */
function headerTypeLabel(t: CampaignsT, headerType: string | null | undefined) {
  switch (headerType) {
    case "TEXT":
      return t("templateCard.headerType.text");
    case "IMAGE":
      return t("templateCard.headerType.image");
    case "VIDEO":
      return t("templateCard.headerType.video");
    case "DOCUMENT":
      return t("templateCard.headerType.document");
    default:
      return t("templateCard.headerType.none");
  }
}

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
  const t = useTranslations("campaigns");

  if (!template) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("templateCard.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Muted>{t("templateCard.empty")}</Muted>
        </CardContent>
      </Card>
    );
  }

  const headerLabel = headerTypeLabel(t, template.headerType);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-5">
      <div className="flex flex-col gap-6 lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("templateCard.title")}</CardTitle>
            <CardAction className="flex items-center gap-2">
              <Badge variant={templateStatusVariant(template.status)}>
                {templateStatusLabel(template.status)}
              </Badge>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/templates/${template.id}`}>
                  {t("templateCard.open")}
                  <ArrowUpRight />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <Field label={t("templateCard.fields.name")} value={template.name} />
            <Field
              label={t("templateCard.fields.category")}
              value={templateCategoryLabel(template.category)}
            />
            <Field
              label={t("templateCard.fields.language")}
              value={formatTemplateLanguage(template.language)}
            />
            <Field label={t("templateCard.fields.header")} value={headerLabel} />
            <div className="space-y-1 sm:col-span-2">
              <Label>{t("templateCard.fields.body")}</Label>
              {template.bodyPreview || template.bodyText ? (
                <P className="whitespace-pre-wrap">
                  {template.bodyPreview ?? template.bodyText}
                </P>
              ) : (
                <Muted>{t("templateCard.noBody")}</Muted>
              )}
            </div>
            {template.footer ? (
              <div className="space-y-1 sm:col-span-2">
                <Label>{t("templateCard.fields.footer")}</Label>
                <P className="text-muted-foreground">{template.footer}</P>
              </div>
            ) : null}
            {template.buttons && template.buttons.length > 0 ? (
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("templateCard.fields.buttons")}</Label>
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
            <CardTitle>{t("templateCard.preview")}</CardTitle>
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
