"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useCreateProcedure } from "@/hooks/queries/use-procedures";
import {
  cleanProcedurePayload,
  createProcedureSchema,
  type CreateProcedureDto,
} from "@/lib/validations/procedure";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const DEFAULT_VALUES: CreateProcedureDto = {
  name: "",
  description: "",
  basePrice: "",
};

/** "Cadastrar procedimento" action + dialog form, validated client-side with Zod. */
export function CreateProcedureDialog() {
  const t = useTranslations("procedures");
  const [open, setOpen] = useState(false);

  const form = useForm<CreateProcedureDto>({
    resolver: zodResolver(createProcedureSchema),
    mode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });

  const { mutate, isPending } = useCreateProcedure();

  function handleOpenChange(next: boolean) {
    if (!next) form.reset(DEFAULT_VALUES);
    setOpen(next);
  }

  function onSubmit(values: CreateProcedureDto) {
    // Only fires after Zod validation passes — safe to forward to the backend.
    mutate(cleanProcedurePayload(values), {
      onSuccess: (procedure) => {
        toast.success(t("toast.created", { name: procedure.name }));
        handleOpenChange(false);
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          {t("newProcedure")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("newProcedure")}</DialogTitle>
          <DialogDescription>
            {t("dialog.create.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="create-procedure-form"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.name.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.name.placeholder")}
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("fields.basePrice.label")}{" "}
                    <span className="font-normal text-muted-foreground">
                      {t("fields.optional")}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      inputMode="decimal"
                      placeholder={t("fields.basePrice.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("fields.description.label")}{" "}
                    <span className="font-normal text-muted-foreground">
                      {t("fields.optional")}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder={t("fields.description.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="submit"
            form="create-procedure-form"
            disabled={!form.formState.isValid || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                {t("dialog.create.submitting")}
              </>
            ) : (
              t("dialog.create.submit")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
