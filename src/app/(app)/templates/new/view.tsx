"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const createTemplate = useCreateTemplate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleSubmit(payload: CreateTemplatePayload) {
    setSubmitError(null);
    createTemplate.mutate(payload, {
      onSuccess: () => {
        toast.success("Template enviado para aprovação!");
        router.push("/templates");
      },
      onError: (error) =>
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Não foi possível criar o template.",
        ),
    });
  }

  return (
    <TemplateEditor
      defaultValues={EMPTY_TEMPLATE}
      title="Novo template"
      description="Monte a mensagem e envie para aprovação da Meta."
      backHref="/templates"
      isSubmitting={createTemplate.isPending}
      submitError={submitError}
      onSubmit={handleSubmit}
    />
  );
}
