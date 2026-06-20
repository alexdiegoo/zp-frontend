"use client";

import type { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
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

const BUTTON_TYPE_LABELS: Record<string, string> = {
  QUICK_REPLY: "Resposta rápida",
  URL: "Acessar link",
};

/**
 * Optional template buttons (max 10). The "Adicionar botão" menu appends either
 * a QUICK_REPLY (text only) or a URL (text + link) row; each row can be removed.
 */
export function ButtonsSection({ form }: ButtonsSectionProps) {
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
        <CardTitle>Botões (opcional)</CardTitle>
        <CardDescription>
          Até {TEMPLATE_MAX_BUTTONS} botões de resposta rápida ou de link.
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
                  {BUTTON_TYPE_LABELS[buttonType] ?? buttonType}
                </Muted>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remover botão"
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
                    <FormLabel>Texto do botão</FormLabel>
                    <FormControl>
                      <Input
                        maxLength={TEMPLATE_BUTTON_TEXT_MAX}
                        placeholder="Ex.: Confirmar"
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
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="url"
                          maxLength={TEMPLATE_BUTTON_URL_MAX}
                          placeholder="https://exemplo.com"
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
              <SelectValue placeholder="Adicionar botão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="QUICK_REPLY">Resposta rápida</SelectItem>
              <SelectItem value="URL">Chamada para ação — Acessar link</SelectItem>
            </SelectContent>
          </Select>
          {atLimit ? (
            <Muted>Limite de {TEMPLATE_MAX_BUTTONS} botões atingido.</Muted>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
