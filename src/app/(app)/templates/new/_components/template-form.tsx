"use client";

import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";

import {
  TEMPLATE_BODY_MAX,
  TEMPLATE_CATEGORY_OPTIONS,
  TEMPLATE_FOOTER_MAX,
  TEMPLATE_HEADER_TEXT_MAX,
  type CreateTemplateForm,
} from "@/lib/validations/template";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Muted } from "@/components/ui/typography";
import { HeaderMediaUpload } from "./header-media-upload";
import { VariableExamplesSection } from "./variable-examples-section";
import { ButtonsSection } from "./buttons-section";

interface TemplateFormProps {
  form: UseFormReturn<CreateTemplateForm>;
  formId: string;
  /** Unique `{{vars}}` extracted from the body, for the examples section. */
  variables: string[];
  isUploading: boolean;
  onUploadingChange: (uploading: boolean) => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}

/** Left column of the editor: every section that builds the template body. */
export function TemplateForm({
  form,
  formId,
  variables,
  isUploading,
  onUploadingChange,
  onSubmit,
}: TemplateFormProps) {
  const { control } = form;
  const headerType = useWatch({ control, name: "headerType" });
  const bodyText = useWatch({ control, name: "bodyText" }) ?? "";
  const footer = useWatch({ control, name: "footer" }) ?? "";

  return (
    <form
      id={formId}
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-6"
    >
      {/* Seção 1 — Informações básicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input
                    placeholder="confirmacao_agendamento"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Apenas letras minúsculas, números e underscore.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idioma</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pt_BR">Português (BR)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TEMPLATE_CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seção 2 — Cabeçalho */}
      <Card>
        <CardHeader>
          <CardTitle>Cabeçalho (opcional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <FormField
            control={control}
            name="headerType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de mídia</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NONE">Nenhum</SelectItem>
                    <SelectItem value="IMAGE">Imagem</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {headerType === "IMAGE" ? (
            <HeaderMediaUpload
              form={form}
              onUploadingChange={onUploadingChange}
              isUploading={isUploading}
            />
          ) : (
            <FormField
              control={control}
              name="headerText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto do cabeçalho</FormLabel>
                  <FormControl>
                    <Input
                      maxLength={TEMPLATE_HEADER_TEXT_MAX}
                      placeholder="Ex.: Confirmação de agendamento"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Sem quebras de linha ou emoji.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Seção 3 — Corpo da mensagem */}
      <Card>
        <CardHeader>
          <CardTitle>Corpo da mensagem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <FormField
            control={control}
            name="bodyText"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    rows={6}
                    maxLength={TEMPLATE_BODY_MAX}
                    placeholder="Olá {{nome}}, seu agendamento foi confirmado para {{data}}."
                    {...field}
                  />
                </FormControl>
                <div className="flex items-center justify-between gap-2">
                  <FormDescription>
                    Use variáveis no formato {"{{nome_variavel}}"}.
                  </FormDescription>
                  <Muted className="tabular-nums">
                    {bodyText.length}/{TEMPLATE_BODY_MAX}
                  </Muted>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Seção 4 — Exemplos de variáveis (condicional) */}
      {variables.length > 0 ? (
        <VariableExamplesSection control={control} variables={variables} />
      ) : null}

      {/* Seção 5 — Rodapé */}
      <Card>
        <CardHeader>
          <CardTitle>Rodapé (opcional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <FormField
            control={control}
            name="footer"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    maxLength={TEMPLATE_FOOTER_MAX}
                    placeholder="Equipe da clínica"
                    {...field}
                  />
                </FormControl>
                <div className="flex items-center justify-between gap-2">
                  <FormDescription>
                    Exibido em cinza abaixo do corpo.
                  </FormDescription>
                  <Muted className="tabular-nums">
                    {footer.length}/{TEMPLATE_FOOTER_MAX}
                  </Muted>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Seção 6 — Botões */}
      <ButtonsSection form={form} />
    </form>
  );
}
