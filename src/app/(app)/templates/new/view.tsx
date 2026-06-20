"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useCreateTemplate } from "@/hooks/queries/use-templates";
import { extractTemplateVariables } from "@/lib/template-display";
import {
  createTemplateFormSchema,
  toCreateTemplatePayload,
  type CreateTemplateForm,
} from "@/lib/validations/template";
import { PageHeader, Section } from "@/components/shared/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TemplateForm } from "./_components/template-form";
import { TemplatePreview } from "./_components/template-preview";

const FORM_ID = "new-template-form";

export function NewTemplateView() {
  const router = useRouter();
  const createTemplate = useCreateTemplate();
  const [isUploading, setIsUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CreateTemplateForm>({
    resolver: zodResolver(createTemplateFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      language: "pt_BR",
      category: undefined,
      headerType: "NONE",
      headerText: "",
      headerMediaUrl: "",
      bodyText: "",
      footer: "",
      buttons: [],
      variableExamples: {},
    },
  });

  // The preview and the variable-examples section both react to body changes.
  const bodyText = useWatch({ control: form.control, name: "bodyText" }) ?? "";
  const variables = useMemo(
    () => extractTemplateVariables(bodyText),
    [bodyText],
  );

  function onSubmit(values: CreateTemplateForm) {
    setSubmitError(null);
    const payload = toCreateTemplatePayload(values, variables);
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

  const submitDisabled =
    !form.formState.isValid || createTemplate.isPending || isUploading;

  return (
    <Section>
      <Form {...form}>
        <PageHeader
          title="Novo template"
          description="Monte a mensagem e envie para aprovação da Meta."
        >
          <Button variant="outline" asChild>
            <Link href="/templates">
              <ArrowLeft />
              Voltar
            </Link>
          </Button>
          <Button type="submit" form={FORM_ID} disabled={submitDisabled}>
            {createTemplate.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Enviando…
              </>
            ) : (
              "Enviar para aprovação"
            )}
          </Button>
        </PageHeader>

        {submitError ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Não foi possível enviar o template.</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid items-start gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <TemplateForm
              form={form}
              formId={FORM_ID}
              variables={variables}
              isUploading={isUploading}
              onUploadingChange={setIsUploading}
              onSubmit={form.handleSubmit(onSubmit)}
            />
          </div>
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-6">
              <TemplatePreview control={form.control} />
            </div>
          </div>
        </div>
      </Form>
    </Section>
  );
}
