"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateCampaign } from "@/hooks/queries/use-campaigns";
import { useTemplate, useTemplates } from "@/hooks/queries/use-templates";
import { useWaPhoneNumbers } from "@/hooks/queries/use-wa-phone-numbers";
import {
  createOfficialCampaignSchema,
  type CreateOfficialCampaignDto,
} from "@/lib/validations/campaign";
import { ContactPicker } from "./contact-picker";

/** Read-only body preview for the currently selected approved template. */
function TemplatePreview({ templateId }: { templateId: string }) {
  const { data, isLoading } = useTemplate(templateId);

  if (isLoading) {
    return <Skeleton className="h-16 w-full" />;
  }

  const preview = data?.bodyPreview ?? data?.bodyText;

  if (!preview) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm whitespace-pre-wrap text-muted-foreground">
      {preview}
    </div>
  );
}

export function OfficialCampaignForm() {
  const router = useRouter();
  const { mutate, isPending } = useCreateCampaign();

  const numbersQuery = useWaPhoneNumbers();
  const templatesQuery = useTemplates({ page: 1, limit: 100, status: "APPROVED" });

  const numbers = numbersQuery.data ?? [];
  const templates = templatesQuery.data?.data ?? [];

  const form = useForm<CreateOfficialCampaignDto>({
    resolver: zodResolver(createOfficialCampaignSchema),
    mode: "onChange",
    defaultValues: {
      apiType: "OFFICIAL",
      name: "",
      waPhoneNumberId: "",
      messageTemplateId: "",
      contactIds: [],
    },
  });

  const selectedTemplateId = useWatch({ control: form.control, name: "messageTemplateId" });

  function onSubmit(values: CreateOfficialCampaignDto) {
    mutate(values, {
      onSuccess: () => {
        toast.success("Campanha criada com sucesso.");
        router.push("/campaigns");
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da campanha</FormLabel>
              <FormControl>
                <Input placeholder="Ex.: Promoção Black Friday 2024" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="waPhoneNumberId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número do WhatsApp</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um número oficial" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {numbers.map((number) => (
                    <SelectItem key={number.id} value={number.id}>
                      {number.number ?? "Número não informado"}
                      {number.displayName ? ` — ${number.displayName}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!numbersQuery.isLoading && numbers.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">
                  Nenhum número oficial conectado. Conecte um WhatsApp Business em Configurações.
                </p>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="messageTemplateId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template da mensagem</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um template aprovado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!templatesQuery.isLoading && templates.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">
                  Nenhum template aprovado disponível. Crie e aprove um template antes de continuar.
                </p>
              ) : null}
              {selectedTemplateId ? (
                <TemplatePreview templateId={selectedTemplateId} />
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactIds"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Contatos</FormLabel>
              <FormControl>
                <ContactPicker
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message ?? null}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/campaigns")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={!form.formState.isValid || isPending}>
            {isPending ? "Criando…" : "Criar campanha"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
