"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

import { useDebounce } from "@/hooks/ui/use-debounce";
import { extractTemplateVariables } from "@/lib/template-display";
import {
  createTemplateFormSchema,
  toCreateTemplatePayload,
  type CreateTemplateForm,
  type CreateTemplatePayload,
} from "@/lib/validations/template";
import { PageHeader, Section } from "@/components/shared/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TemplateForm } from "./template-form";
import { TemplatePreview } from "./template-preview";

const FORM_ID = "template-editor-form";

interface TemplateEditorProps {
  /** Initial form values — empty for creation, prefilled for editing. */
  defaultValues: CreateTemplateForm;
  title: string;
  description: string;
  /** Where the "Voltar" button points. */
  backHref: string;
  /** Whether the submit mutation is in flight (drives the button spinner). */
  isSubmitting: boolean;
  /** Submit error to surface above the form (cleared by the parent on retry). */
  submitError: string | null;
  /** Receives the cleaned wire payload once the form passes validation. */
  onSubmit: (payload: CreateTemplatePayload) => void;
}

/**
 * The shared "monte a mensagem e envie para aprovação" editor used by both the
 * create (`/templates/new`) and edit (`/templates/:id/edit`) pages. Owns the
 * form instance, live variable extraction and layout; the parent owns the
 * mutation (create vs. update) and feeds in `defaultValues`, submit state and
 * the success/error handling.
 */
export function TemplateEditor({
  defaultValues,
  title,
  description,
  backHref,
  isSubmitting,
  submitError,
  onSubmit,
}: TemplateEditorProps) {
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<CreateTemplateForm>({
    resolver: zodResolver(createTemplateFormSchema),
    mode: "onChange",
    defaultValues,
  });

  // The variable-examples section reacts to the body, but only after typing
  // settles — otherwise each intermediate `{{c}}`, `{{cl}}`… would spawn a
  // throwaway variable.
  const bodyText = useWatch({ control: form.control, name: "bodyText" }) ?? "";
  const debouncedBody = useDebounce(bodyText);
  const variables = useMemo(
    () => extractTemplateVariables(debouncedBody),
    [debouncedBody],
  );

  function handleValid(values: CreateTemplateForm) {
    onSubmit(toCreateTemplatePayload(values, variables));
  }

  const submitDisabled =
    !form.formState.isValid || isSubmitting || isUploading;

  return (
    <Section>
      <Form {...form}>
        <PageHeader title={title} description={description}>
          <Button variant="outline" asChild>
            <Link href={backHref}>
              <ArrowLeft />
              Voltar
            </Link>
          </Button>
          <Button type="submit" form={FORM_ID} disabled={submitDisabled}>
            {isSubmitting ? (
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
              onSubmit={form.handleSubmit(handleValid)}
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
