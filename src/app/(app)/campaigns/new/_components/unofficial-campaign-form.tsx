"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("campaigns");
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
        toast.success(t("toast.created"));
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
              <FormLabel>{t("form.name.label")}</FormLabel>
              <FormControl>
                <Input placeholder={t("unofficial.name.placeholder")} {...field} />
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
              <FormLabel>{t("unofficial.message.label")}</FormLabel>
              <FormControl>
                <Textarea
                  rows={6}
                  placeholder={t("unofficial.message.placeholder")}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t("unofficial.message.description")}
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
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={!form.formState.isValid || isPending}>
            {isPending ? t("form.submitting") : t("form.submit")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
