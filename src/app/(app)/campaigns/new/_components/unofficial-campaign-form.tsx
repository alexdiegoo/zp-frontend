"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateCampaign } from "@/hooks/queries/use-campaigns";
import {
  createUnofficialCampaignSchema,
  type CreateUnofficialCampaignDto,
} from "@/lib/validations/campaign";
import type { CreatedCampaign } from "@/types/api";

interface UnofficialCampaignFormProps {
  /** Called with the created campaign so the parent can show the copy-message screen. */
  onCreated: (campaign: CreatedCampaign) => void;
}

export function UnofficialCampaignForm({ onCreated }: UnofficialCampaignFormProps) {
  const router = useRouter();
  const { mutate, isPending } = useCreateCampaign();

  const form = useForm<CreateUnofficialCampaignDto>({
    resolver: zodResolver(createUnofficialCampaignSchema),
    mode: "onChange",
    defaultValues: {
      apiType: "UNOFFICIAL",
      name: "",
      message: "",
    },
  });

  function onSubmit(values: CreateUnofficialCampaignDto) {
    mutate(values, {
      onSuccess: (campaign) => {
        toast.success("Campanha criada com sucesso.");
        onCreated(campaign);
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
                <Input placeholder="Ex.: Reativação de pacientes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensagem</FormLabel>
              <FormControl>
                <Textarea
                  rows={6}
                  placeholder="Escreva a mensagem que os operadores irão enviar…"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Copie a mensagem abaixo e envie para seus contatos.
              </FormDescription>
              <FormMessage />
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
