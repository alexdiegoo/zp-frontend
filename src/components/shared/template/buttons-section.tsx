"use client";

import type { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

import {
  TEMPLATE_BUTTON_TEXT_MAX,
  TEMPLATE_BUTTON_URL_MAX,
  TEMPLATE_MAX_BUTTONS,
  type CreateTemplateForm,
} from "@/lib/validations/template";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Muted } from "@/components/ui/typography";

interface ButtonsSectionProps {
  form: UseFormReturn<CreateTemplateForm>;
}

/**
 * Optional template buttons (max 10). The "Adicionar botão" menu appends either
 * a QUICK_REPLY (text only) or a URL (text + link) row; each row can be removed.
 */
export function ButtonsSection({ form }: ButtonsSectionProps) {
  const t = useTranslations("templates");
  const { control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "buttons",
  });

  const atLimit = fields.length >= TEMPLATE_MAX_BUTTONS;

  function addButton(type: "QUICK_REPLY" | "URL") {
    if (atLimit) return;
    append(type === "URL" ? { type, text: "", url: "" } : { type, text: "" });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("form.buttons.title")}</CardTitle>
        <CardDescription>
          {t("form.buttons.description", { max: TEMPLATE_MAX_BUTTONS })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field, index) => {
          const buttonType = (field as { type: "QUICK_REPLY" | "URL" }).type;
          return (
            <div
              key={field.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-3"
            >
              <div className="flex items-center justify-between">
                <Muted className="font-medium">
                  {buttonType === "URL"
                    ? t("form.buttons.type.url")
                    : t("form.buttons.type.quickReply")}
                </Muted>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("form.buttons.remove")}
                  onClick={() => remove(index)}
                >
                  <X />
                </Button>
              </div>

              <FormField
                control={control}
                name={`buttons.${index}.text`}
                render={({ field: textField }) => (
                  <FormItem>
                    <FormLabel>{t("form.buttons.textLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        maxLength={TEMPLATE_BUTTON_TEXT_MAX}
                        placeholder={t("form.buttons.textPlaceholder")}
                        {...textField}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {buttonType === "URL" ? (
                <FormField
                  control={control}
                  name={`buttons.${index}.url`}
                  render={({ field: urlField }) => (
                    <FormItem>
                      <FormLabel>{t("form.buttons.urlLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="url"
                          maxLength={TEMPLATE_BUTTON_URL_MAX}
                          placeholder={t("form.buttons.urlPlaceholder")}
                          {...urlField}
                          value={urlField.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
            </div>
          );
        })}

        <div className="flex items-center gap-3">
          <Select
            value=""
            onValueChange={(value) =>
              addButton(value as "QUICK_REPLY" | "URL")
            }
            disabled={atLimit}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("form.buttons.add")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="QUICK_REPLY">
                {t("form.buttons.type.quickReply")}
              </SelectItem>
              <SelectItem value="URL">{t("form.buttons.type.cta")}</SelectItem>
            </SelectContent>
          </Select>
          {atLimit ? (
            <Muted>
              {t("form.buttons.limitReached", { max: TEMPLATE_MAX_BUTTONS })}
            </Muted>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
