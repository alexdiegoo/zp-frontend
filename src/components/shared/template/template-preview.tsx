"use client";

import type { Control } from "react-hook-form";
import { useWatch } from "react-hook-form";

import type { CreateTemplateForm } from "@/lib/validations/template";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TemplateMessagePreview } from "@/components/shared/template/template-message-preview";

interface TemplatePreviewProps {
  control: Control<CreateTemplateForm>;
}

/** Right column: a live WhatsApp-style bubble mirroring the form. */
export function TemplatePreview({ control }: TemplatePreviewProps) {
  const [headerType, headerText, headerMediaUrl, bodyText, footer, buttons] =
    useWatch({
      control,
      name: [
        "headerType",
        "headerText",
        "headerMediaUrl",
        "bodyText",
        "footer",
        "buttons",
      ],
    });

  const variableExamples = useWatch({ control, name: "variableExamples" });

  // The form's record allows `undefined` values (optional per-variable inputs);
  // drop them so the preview gets a clean `Record<string, string>`.
  const filledExamples: Record<string, string> = {};
  for (const [key, value] of Object.entries(variableExamples ?? {})) {
    if (value) filledExamples[key] = value;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pré-visualização</CardTitle>
      </CardHeader>
      <CardContent>
        <TemplateMessagePreview
          headerType={headerType}
          headerText={headerText}
          headerMediaUrl={headerMediaUrl}
          bodyText={bodyText}
          variableExamples={filledExamples}
          footer={footer}
          buttons={buttons}
        />
      </CardContent>
    </Card>
  );
}
