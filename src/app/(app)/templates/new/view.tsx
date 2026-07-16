"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useCreateTemplate } from "@/hooks/queries/use-templates";
import type {
  CreateTemplateForm,
  CreateTemplatePayload,
} from "@/lib/validations/template";
import { TemplateEditor } from "@/components/shared/template/template-editor";

const EMPTY_TEMPLATE: CreateTemplateForm = {
  name: "",
  language: "pt_BR",
  category: "MARKETING",
  headerType: "NONE",
  headerText: "",
  headerMediaUrl: "",
  bodyText: "",
  footer: "",
  buttons: [],
  variableExamples: {},
};

export function NewTemplateView() {
  const t = useTranslations("templates");
  const router = useRouter();
  const createTemplate = useCreateTemplate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleSubmit(payload: CreateTemplatePayload) {
    setSubmitError(null);
    createTemplate.mutate(payload, {
      onSuccess: () => {
        toast.success(t("toast.created"));
        router.push("/templates");
      },
      onError: (error) =>
        setSubmitError(
          error instanceof Error ? error.message : t("error.create"),
        ),
    });
  }

  return (
    <TemplateEditor
      defaultValues={EMPTY_TEMPLATE}
      title={t("new.title")}
      description={t("new.description")}
      backHref="/templates"
      isSubmitting={createTemplate.isPending}
      submitError={submitError}
      onSubmit={handleSubmit}
    />
  );
}
