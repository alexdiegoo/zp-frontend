"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  return (
    <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
      <Link href={href}>
        <ArrowLeft />
        Voltar
      </Link>
    </Button>
  );
}

export function EditTemplateView({ templateId }: { templateId: string }) {
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

  function handleSubmit(payload: CreateTemplatePayload) {
    setSubmitError(null);
    updateTemplate.mutate(payload, {
      onSuccess: () => {
        toast.success("Template atualizado e enviado para nova validação!");
        router.push(`/templates/${templateId}`);
      },
      onError: (mutationError) =>
        setSubmitError(
          mutationError instanceof Error
            ? mutationError.message
            : "Não foi possível atualizar o template.",
        ),
    });
  }

  return (
    <TemplateEditor
      defaultValues={toTemplateFormValues(template)}
      title="Editar template"
      description="Atualize a mensagem e envie para uma nova validação por IA."
      backHref={`/templates/${templateId}`}
      isSubmitting={updateTemplate.isPending}
      submitError={submitError}
      onSubmit={handleSubmit}
    />
  );
}
