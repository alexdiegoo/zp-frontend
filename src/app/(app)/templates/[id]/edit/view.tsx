"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { useTemplate, useUpdateTemplate } from "@/hooks/queries/use-templates";
import {
  toTemplateFormValues,
  type CreateTemplatePayload,
} from "@/lib/validations/template";
import { Section } from "@/components/shared/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TemplateEditor } from "@/components/shared/template/template-editor";

function BackLink({ href }: { href: string }) {
  const t = useTranslations("templates");
  return (
    <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
      <Link href={href}>
        <ArrowLeft />
        {t("back")}
      </Link>
    </Button>
  );
}

export function EditTemplateView({ templateId }: { templateId: string }) {
  const t = useTranslations("templates");
  const router = useRouter();
  const { data: template, isLoading, isError, error } = useTemplate(templateId);
  const updateTemplate = useUpdateTemplate(templateId);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Section>
        <BackLink href={`/templates/${templateId}`} />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-72" />
      </Section>
    );
  }

  if (isError || !template) {
    return (
      <Section>
        <BackLink href={`/templates/${templateId}`} />
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

  function handleSubmit(payload: CreateTemplatePayload) {
    setSubmitError(null);
    updateTemplate.mutate(payload, {
      onSuccess: () => {
        toast.success(t("toast.updated"));
        router.push(`/templates/${templateId}`);
      },
      onError: (mutationError) =>
        setSubmitError(
          mutationError instanceof Error
            ? mutationError.message
            : t("error.update"),
        ),
    });
  }

  return (
    <TemplateEditor
      defaultValues={toTemplateFormValues(template)}
      title={t("edit.title")}
      description={t("edit.description")}
      backHref={`/templates/${templateId}`}
      isSubmitting={updateTemplate.isPending}
      submitError={submitError}
      onSubmit={handleSubmit}
    />
  );
}
