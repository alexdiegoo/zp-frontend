"use client";

import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  DollarSign,
  Loader2,
  Stethoscope,
  User,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import {
  useCancelAppointment,
  useUpdateAppointmentStatus,
} from "@/hooks/queries/use-appointments";
import { formatDayLabel, formatTime } from "@/lib/calendar";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Appointment, AppointmentStatus } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APPOINTMENT_TYPE_META } from "./appointment-card";

/** Per-status label + badge variant for the detail header. */
const STATUS_META: Record<
  AppointmentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  SCHEDULED: { label: "Agendado", variant: "secondary" },
  IN_PROGRESS: { label: "Em andamento", variant: "default" },
  DONE: { label: "Realizado", variant: "default" },
  CANCELLED: { label: "Cancelado", variant: "destructive" },
  NO_SHOW: { label: "Não compareceu", variant: "destructive" },
};

interface AppointmentDetailsDialogProps {
  /** The clicked appointment; the dialog is open while this is non-null. */
  appointment: Appointment | null;
  onClose: () => void;
  /** Opens the reschedule dialog for the given appointment. */
  onReschedule: (appointment: Appointment) => void;
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof User;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium text-foreground">{children}</div>
      </div>
    </div>
  );
}

/**
 * Detail dialog opened by clicking a calendar card. Shows the appointment's
 * data and exposes the lifecycle actions: confirm completion, reschedule,
 * cancel, and jump to the patient's profile.
 */
export function AppointmentDetailsDialog({
  appointment,
  onClose,
  onReschedule,
}: AppointmentDetailsDialogProps) {
  const router = useRouter();
  const { mutate: updateStatus, isPending: isConfirming } =
    useUpdateAppointmentStatus();
  const { mutate: cancel, isPending: isCancelling } = useCancelAppointment();

  const open = appointment !== null;
  const busy = isConfirming || isCancelling;

  function handleOpenChange(next: boolean) {
    if (!next && !busy) onClose();
  }

  if (!appointment) {
    return <Dialog open={open} onOpenChange={handleOpenChange} />;
  }

  const typeMeta = APPOINTMENT_TYPE_META[appointment.type];
  const statusMeta = STATUS_META[appointment.status];
  const start = new Date(appointment.startAt);
  const end = new Date(appointment.endAt);
  const isFinal =
    appointment.status === "DONE" || appointment.status === "CANCELLED";
  const canConfirm =
    appointment.status === "SCHEDULED" || appointment.status === "IN_PROGRESS";

  function handleConfirm() {
    // Reuse the price recorded when the appointment was created (the backend
    // seeds it from the procedure's catalog price); DONE requires it. Falls back
    // to 0 only if no price was ever recorded, so completion never 422s.
    updateStatus(
      {
        id: appointment!.id,
        status: "DONE",
        priceCharged: appointment!.procedureRecord?.priceCharged ?? 0,
      },
      {
        onSuccess: () => {
          toast.success("Realização confirmada.");
          onClose();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function handleCancel() {
    cancel(appointment!.id, {
      onSuccess: () => {
        toast.success("Agendamento cancelado.");
        onClose();
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle>{typeMeta.label}</DialogTitle>
            <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
          </div>
          <DialogDescription>
            {formatDayLabel(start)} · {formatTime(start)} – {formatTime(end)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <DetailRow icon={User} label="Paciente">
            {appointment.patient.name}
            <span className="block text-xs font-normal text-muted-foreground">
              {appointment.patient.whatsappNumber}
            </span>
          </DetailRow>

          <DetailRow icon={Stethoscope} label="Procedimento">
            {appointment.procedure?.name ?? "—"}
          </DetailRow>

          <DetailRow icon={DollarSign} label="Valor do procedimento">
            {formatCurrency(appointment.procedureRecord?.priceCharged)}
          </DetailRow>

          <DetailRow icon={UserRound} label="Profissional">
            {appointment.professional?.name ?? "Não atribuído"}
          </DetailRow>

          {appointment.notes ? (
            <DetailRow icon={CalendarClock} label="Observações">
              <span className="font-normal whitespace-pre-wrap">
                {appointment.notes}
              </span>
            </DetailRow>
          ) : null}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col sm:gap-2">
          <div className="grid grid-cols-2 gap-2">
            {canConfirm ? (
              <Button onClick={handleConfirm} disabled={busy}>
                {isConfirming ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <CheckCircle2 />
                )}
                Confirmar realização
              </Button>
            ) : null}

            {!isFinal ? (
              <Button
                variant="outline"
                onClick={() => onReschedule(appointment)}
                disabled={busy}
              >
                <CalendarClock />
                Reagendar
              </Button>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push(`/patients/${appointment.patient.id}`)}
              disabled={busy}
            >
              <User />
              Ver paciente
            </Button>

            {!isFinal ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={busy}>
                    {isCancelling ? (
                      <Loader2 className="animate-spin" />
                    ) : null}
                    Cancelar agendamento
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancelar agendamento?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação marca o agendamento de{" "}
                      <span className="font-medium text-foreground">
                        {appointment.patient.name}
                      </span>{" "}
                      como cancelado. Não é possível desfazer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isCancelling}>
                      Voltar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault();
                        handleCancel();
                      }}
                      disabled={isCancelling}
                      className={cn(
                        "bg-destructive text-white hover:bg-destructive/90",
                      )}
                    >
                      {isCancelling ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Cancelando…
                        </>
                      ) : (
                        "Cancelar agendamento"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
