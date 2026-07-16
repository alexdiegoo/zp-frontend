"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useCreatePatient } from "@/hooks/queries/use-patients";
import {
  cleanPatientPayload,
  createPatientSchema,
  type CreatePatientDto,
} from "@/lib/validations/patient";
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

const DEFAULT_VALUES: CreatePatientDto = {
  name: "",
  whatsappNumber: "",
  email: "",
  birthDate: "",
  address: "",
  acquisitionSource: "",
};

/** "Cadastrar paciente" action + dialog form, validated client-side with Zod. */
export function CreatePatientDialog() {
  const t = useTranslations("leads");
  const [open, setOpen] = useState(false);

  const form = useForm<CreatePatientDto>({
    resolver: zodResolver(createPatientSchema),
    mode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });

  const { mutate, isPending } = useCreatePatient();

  function handleOpenChange(next: boolean) {
    if (!next) form.reset(DEFAULT_VALUES);
    setOpen(next);
  }

  function onSubmit(values: CreatePatientDto) {
    // Only fires after Zod validation passes — safe to forward to the backend.
    mutate(cleanPatientPayload(values), {
      onSuccess: (patient) => {
        toast.success(t("dialog.create.toast.created", { name: patient.name }));
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
          {t("newPatient")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dialog.create.title")}</DialogTitle>
          <DialogDescription>{t("dialog.create.description")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="create-patient-form"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.name")}</FormLabel>
                  <FormControl>
                    <Input placeholder="Maria Silva" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsappNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.whatsapp")}</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      autoComplete="tel"
                      placeholder="+55 (11) 99999-8888"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("fields.email")}{" "}
                    <span className="font-normal text-muted-foreground">
                      {t("fields.optional")}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="maria@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("fields.birthDate")}{" "}
                    <span className="font-normal text-muted-foreground">
                      {t("fields.optional")}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acquisitionSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("fields.source")}{" "}
                    <span className="font-normal text-muted-foreground">
                      {t("fields.optional")}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.sourcePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("fields.address")}{" "}
                    <span className="font-normal text-muted-foreground">
                      {t("fields.optional")}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.addressPlaceholder")}
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
            form="create-patient-form"
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
