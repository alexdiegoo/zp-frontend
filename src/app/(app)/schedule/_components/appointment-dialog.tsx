"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useCreateAppointment } from "@/hooks/queries/use-appointments";
import { useProfessionals } from "@/hooks/queries/use-professionals";
import {
  APPOINTMENT_TYPE_OPTIONS,
  createAppointmentFormSchema,
  type CreateAppointmentForm,
  type CreateAppointmentPayload,
} from "@/lib/validations/appointment";
import { formatDayLabel, formatTime } from "@/lib/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PatientCombobox } from "./patient-combobox";
import { ProcedureCombobox } from "./procedure-combobox";

const NONE = "__none__";

interface AppointmentDialogProps {
  /** The clicked slot's start time; the dialog is open while this is non-null. */
  start: Date | null;
  onClose: () => void;
}

function buildDefaults(start: Date | null): CreateAppointmentForm {
  return {
    type: "CONSULTATION",
    patientId: "",
    procedureId: "",
    priceCharged: "",
    professionalId: "",
    durationMinutes: "30",
    notes: "",
    startAt: start ? start.toISOString() : "",
  };
}

/**
 * Creation dialog opened from a calendar slot. Date/time are pre-filled from the
 * slot; the type drives conditional fields (price for PROCEDURE). On success it
 * closes and the calendar refetches via the mutation's cache invalidation.
 */
export function AppointmentDialog({ start, onClose }: AppointmentDialogProps) {
  const t = useTranslations("schedule");
  const open = start !== null;

  const form = useForm<CreateAppointmentForm>({
    resolver: zodResolver(createAppointmentFormSchema),
    mode: "onChange",
    defaultValues: buildDefaults(start),
  });

  // Re-seed the form whenever a new slot opens the dialog.
  useEffect(() => {
    if (start) form.reset(buildDefaults(start));
  }, [start, form]);

  const { data: professionals } = useProfessionals();
  const { mutate, isPending } = useCreateAppointment();

  const type = useWatch({ control: form.control, name: "type" });
  const duration = useWatch({ control: form.control, name: "durationMinutes" });
  const isProcedure = type === "PROCEDURE";

  const endLabel = useMemo(() => {
    if (!start) return null;
    const minutes = Number(duration);
    if (!Number.isFinite(minutes) || minutes <= 0) return null;
    return formatTime(new Date(start.getTime() + minutes * 60_000));
  }, [start, duration]);

  function handleOpenChange(next: boolean) {
    if (!next) onClose();
  }

  function onSubmit(values: CreateAppointmentForm) {
    const startDate = new Date(values.startAt);
    const endDate = new Date(
      startDate.getTime() + Number(values.durationMinutes) * 60_000,
    );

    const payload: CreateAppointmentPayload = {
      type: values.type,
      patientId: values.patientId,
      procedureId: values.procedureId,
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
    };

    if (values.professionalId && values.professionalId !== NONE) {
      payload.professionalId = values.professionalId;
    }
    if (values.notes?.trim()) payload.notes = values.notes.trim();
    if (isProcedure && values.priceCharged?.trim()) {
      payload.priceCharged = Number(values.priceCharged.replace(",", "."));
    }

    mutate(payload, {
      onSuccess: () => {
        toast.success(t("toast.created"));
        onClose();
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("dialog.create.title")}</DialogTitle>
          <DialogDescription>
            {start
              ? `${formatDayLabel(start)} · ${formatTime(start)}${
                  endLabel ? ` – ${endLabel}` : ""
                }`
              : null}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="create-appointment-form"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.type")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("fields.typePlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {APPOINTMENT_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.value === "CONSULTATION"
                            ? t("type.consultation")
                            : option.value === "PROCEDURE"
                              ? t("type.procedure")
                              : t("type.return")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="patientId"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("fields.patient")}</FormLabel>
                  <PatientCombobox
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    invalid={!!fieldState.error}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="procedureId"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("fields.procedure")}</FormLabel>
                  <ProcedureCombobox
                    value={field.value}
                    onChange={(procedureId, procedure) => {
                      field.onChange(procedureId);
                      // Pre-fill the charged price from the catalog when relevant.
                      if (isProcedure && procedure?.currentPrice != null) {
                        form.setValue(
                          "priceCharged",
                          String(procedure.currentPrice).replace(".", ","),
                          { shouldValidate: true },
                        );
                      }
                    }}
                    onBlur={field.onBlur}
                    invalid={!!fieldState.error}
                  />
                  <FormDescription>
                    {t("fields.procedureHint")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isProcedure ? (
              <FormField
                control={form.control}
                name="priceCharged"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.priceCharged")}</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="decimal"
                        placeholder={t("fields.pricePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="professionalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("fields.professional")}{" "}
                      <span className="font-normal text-muted-foreground">
                        {t("fields.optional")}
                      </span>
                    </FormLabel>
                    <Select
                      value={field.value || NONE}
                      onValueChange={(v) =>
                        field.onChange(v === NONE ? "" : v)
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("fields.selectPlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>{t("fields.none")}</SelectItem>
                        {(professionals ?? []).map((pro) => (
                          <SelectItem key={pro.id} value={pro.id}>
                            {pro.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.duration")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={5}
                        step={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("fields.notes")}{" "}
                    <span className="font-normal text-muted-foreground">
                      {t("fields.optional")}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      maxLength={2000}
                      placeholder={t("fields.notesPlaceholder")}
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
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            {t("actions.cancel")}
          </Button>
          <Button
            type="submit"
            form="create-appointment-form"
            disabled={!form.formState.isValid || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                {t("actions.saving")}
              </>
            ) : (
              t("actions.schedule")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
