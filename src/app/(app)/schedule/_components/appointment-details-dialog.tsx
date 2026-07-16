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
import { useTranslations } from "next-intl";
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

/** Per-status badge variant for the detail header. */
const STATUS_VARIANT: Record<
  AppointmentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  SCHEDULED: "secondary",
  IN_PROGRESS: "default",
  DONE: "default",
  CANCELLED: "destructive",
  NO_SHOW: "destructive",
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
  const t = useTranslations("schedule");
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

  const statusVariant = STATUS_VARIANT[appointment.status];
  const typeLabel =
    appointment.type === "CONSULTATION"
      ? t("type.consultation")
      : appointment.type === "PROCEDURE"
        ? t("type.procedure")
        : t("type.return");
  const statusLabel =
    appointment.status === "SCHEDULED"
      ? t("status.scheduled")
      : appointment.status === "IN_PROGRESS"
        ? t("status.inProgress")
        : appointment.status === "DONE"
          ? t("status.done")
          : appointment.status === "CANCELLED"
            ? t("status.cancelled")
            : t("status.noShow");
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
          toast.success(t("toast.confirmed"));
          onClose();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function handleCancel() {
    cancel(appointment!.id, {
      onSuccess: () => {
        toast.success(t("toast.cancelled"));
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
            <DialogTitle>{typeLabel}</DialogTitle>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </div>
          <DialogDescription>
            {formatDayLabel(start)} · {formatTime(start)} – {formatTime(end)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <DetailRow icon={User} label={t("fields.patient")}>
            {appointment.patient.name}
            <span className="block text-xs font-normal text-muted-foreground">
              {appointment.patient.whatsappNumber}
            </span>
          </DetailRow>

          <DetailRow icon={Stethoscope} label={t("fields.procedure")}>
            {appointment.procedure?.name ?? "—"}
          </DetailRow>

          <DetailRow icon={DollarSign} label={t("fields.procedurePrice")}>
            {formatCurrency(appointment.procedureRecord?.priceCharged)}
          </DetailRow>

          <DetailRow icon={UserRound} label={t("fields.professional")}>
            {appointment.professional?.name ?? t("details.unassigned")}
          </DetailRow>

          {appointment.notes ? (
            <DetailRow icon={CalendarClock} label={t("fields.notes")}>
              <span className="font-normal whitespace-pre-wrap">
                {appointment.notes}
              </span>
            </DetailRow>
          ) : null}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col sm:gap-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {canConfirm ? (
              <Button onClick={handleConfirm} disabled={busy}>
                {isConfirming ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <CheckCircle2 />
                )}
                {t("actions.confirmDone")}
              </Button>
            ) : null}

            {!isFinal ? (
              <Button
                variant="outline"
                onClick={() => onReschedule(appointment)}
                disabled={busy}
              >
                <CalendarClock />
                {t("actions.reschedule")}
              </Button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              variant="secondary"
              onClick={() => router.push(`/patients/${appointment.patient.id}`)}
              disabled={busy}
            >
              <User />
              {t("actions.viewPatient")}
            </Button>

            {!isFinal ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={busy}>
                    {isCancelling ? (
                      <Loader2 className="animate-spin" />
                    ) : null}
                    {t("actions.cancelAppointment")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("cancelConfirm.title")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t.rich("cancelConfirm.description", {
                        name: appointment.patient.name,
                        strong: (chunks) => (
                          <span className="font-medium text-foreground">
                            {chunks}
                          </span>
                        ),
                      })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isCancelling}>
                      {t("actions.back")}
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
                          {t("actions.cancelling")}
                        </>
                      ) : (
                        t("actions.cancelAppointment")
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
