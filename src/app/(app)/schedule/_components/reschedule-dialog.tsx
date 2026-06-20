"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useRescheduleAppointment } from "@/hooks/queries/use-appointments";
import { useProfessionals } from "@/hooks/queries/use-professionals";
import {
  rescheduleFormSchema,
  type RescheduleForm,
  type ReschedulePayload,
} from "@/lib/validations/appointment";
import { formatTime } from "@/lib/calendar";
import type { Appointment } from "@/types/api";
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

const NONE = "__none__";

interface RescheduleDialogProps {
  /** The appointment being rescheduled; the dialog is open while this is non-null. */
  appointment: Appointment | null;
  onClose: () => void;
  /** Called after a successful reschedule so the parent can close the detail view. */
  onRescheduled?: () => void;
}

/** Formats a Date as the `YYYY-MM-DDTHH:mm` value a `datetime-local` input expects. */
function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function buildDefaults(appointment: Appointment | null): RescheduleForm {
  if (!appointment) {
    return { startAt: "", durationMinutes: "30", professionalId: "" };
  }
  const start = new Date(appointment.startAt);
  const end = new Date(appointment.endAt);
  const minutes = Math.max(5, Math.round((end.getTime() - start.getTime()) / 60_000));
  return {
    startAt: toLocalInput(start),
    durationMinutes: String(minutes),
    professionalId: appointment.professionalId ?? "",
  };
}

/**
 * Reschedule dialog opened from the appointment-detail dialog. Pre-fills the
 * current date/time, duration and professional; on success it invalidates the
 * calendar and closes both dialogs.
 */
export function RescheduleDialog({
  appointment,
  onClose,
  onRescheduled,
}: RescheduleDialogProps) {
  const open = appointment !== null;

  const form = useForm<RescheduleForm>({
    resolver: zodResolver(rescheduleFormSchema),
    mode: "onChange",
    defaultValues: buildDefaults(appointment),
  });

  useEffect(() => {
    if (appointment) form.reset(buildDefaults(appointment));
  }, [appointment, form]);

  const { data: professionals } = useProfessionals();
  const { mutate, isPending } = useRescheduleAppointment();

  const startAt = useWatch({ control: form.control, name: "startAt" });
  const duration = useWatch({ control: form.control, name: "durationMinutes" });

  const endLabel = useMemo(() => {
    if (!startAt) return null;
    const start = new Date(startAt);
    const minutes = Number(duration);
    if (Number.isNaN(start.getTime()) || !Number.isFinite(minutes) || minutes <= 0) {
      return null;
    }
    return formatTime(new Date(start.getTime() + minutes * 60_000));
  }, [startAt, duration]);

  function handleOpenChange(next: boolean) {
    if (!next) onClose();
  }

  function onSubmit(values: RescheduleForm) {
    if (!appointment) return;

    const startDate = new Date(values.startAt);
    const endDate = new Date(
      startDate.getTime() + Number(values.durationMinutes) * 60_000,
    );

    const payload: ReschedulePayload = {
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
    };
    if (values.professionalId && values.professionalId !== NONE) {
      payload.professionalId = values.professionalId;
    }

    mutate(
      { id: appointment.id, ...payload },
      {
        onSuccess: () => {
          toast.success("Agendamento remarcado com sucesso.");
          onClose();
          onRescheduled?.();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reagendar</DialogTitle>
          <DialogDescription>
            Escolha a nova data e horário do agendamento
            {endLabel ? ` (término às ${endLabel}).` : "."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="reschedule-appointment-form"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="startAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova data e horário</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="durationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração (min)</FormLabel>
                  <FormControl>
                    <Input type="number" min={5} step={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="professionalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Profissional{" "}
                    <span className="font-normal text-muted-foreground">
                      (opcional)
                    </span>
                  </FormLabel>
                  <Select
                    value={field.value || NONE}
                    onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE}>Nenhum</SelectItem>
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
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Voltar
          </Button>
          <Button
            type="submit"
            form="reschedule-appointment-form"
            disabled={!form.formState.isValid || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Salvando…
              </>
            ) : (
              "Reagendar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
