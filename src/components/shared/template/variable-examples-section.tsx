"use client";

import type { Control } from "react-hook-form";
import { useTranslations } from "next-intl";

import type { CreateTemplateForm } from "@/lib/validations/template";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface VariableExamplesSectionProps {
  control: Control<CreateTemplateForm>;
  /** Unique variable names extracted from the body. */
  variables: string[];
}

/**
 * One example input per `{{variable}}` found in the body. Shown only when the
 * body declares at least one variable; the values feed `variableExamples`.
 */
export function VariableExamplesSection({
  control,
  variables,
}: VariableExamplesSectionProps) {
  const t = useTranslations("templates");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("form.variables.title")}</CardTitle>
        <CardDescription>{t("form.variables.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {variables.map((variable) => (
          <FormField
            key={variable}
            control={control}
            name={`variableExamples.${variable}`}
            shouldUnregister
            render={({ field }) => (
              <FormItem>
                <FormLabel>{`{{${variable}}}`}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("form.variables.examplePlaceholder", {
                      variable: `{{${variable}}}`,
                    })}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </CardContent>
    </Card>
  );
}
