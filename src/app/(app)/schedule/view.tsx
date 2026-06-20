"use client";

import { useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  appointmentKeys,
  useAppointments,
  useRescheduleAppointment,
} from "@/hooks/queries/use-appointments";
import {
  addDays,
  slotToDate,
  startOfDay,
  startOfWeek,
  type ViewMode,
} from "@/lib/calendar";
import type {
  Appointment,
  AppointmentsListResponse,
} from "@/types/api";
import type { ReschedulePayload } from "@/lib/validations/appointment";
import { PageHeader, Section } from "@/components/shared/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarHeader } from "./_components/calendar-header";
import { WeekView } from "./_components/week-view";
import { DayView } from "./_components/day-view";
import { AppointmentDialog } from "./_components/appointment-dialog";
import { AppointmentDetailsDialog } from "./_components/appointment-details-dialog";
import { RescheduleDialog } from "./_components/reschedule-dialog";

/** Derives the ISO `[startAt, endAt)` window the API should fetch for the view. */
function windowFor(date: Date, mode: ViewMode) {
  const start = mode === "week" ? startOfWeek(date) : startOfDay(date);
  const end = addDays(start, mode === "week" ? 7 : 1);
  return { startAt: start.toISOString(), endAt: end.toISOString() };
}

export function ScheduleView() {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  // Default to the current week/day; `Date` is only created on the client.
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [slotStart, setSlotStart] = useState<Date | null>(null);
  // The currently-open detail/reschedule appointment, tracked by id so the
  // dialogs always read fresh data after the calendar refetches.
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);

  const params = useMemo(
    () => windowFor(currentDate, viewMode),
    [currentDate, viewMode],
  );
  const { data, isLoading, isError, error, refetch } = useAppointments(params);
  // Cancelled appointments free up their slot — keep them off the calendar.
  const appointments = useMemo(
    () => (data ?? []).filter((appt) => appt.status !== "CANCELLED"),
    [data],
  );

  const qc = useQueryClient();
  const { mutate: reschedule } = useRescheduleAppointment();

  const detailsAppointment =
    appointments.find((appt) => appt.id === detailsId) ?? null;
  const rescheduleAppointment =
    appointments.find((appt) => appt.id === rescheduleId) ?? null;

  const step = viewMode === "week" ? 7 : 1;
  const goPrev = () => setCurrentDate((d) => addDays(d, -step));
  const goNext = () => setCurrentDate((d) => addDays(d, step));
  const goToday = () => setCurrentDate(new Date());

  const handleSlotClick = (day: Date, slotIndex: number) =>
    setSlotStart(slotToDate(day, slotIndex));

  const handleAppointmentClick = (appointmentId: string) =>
    setDetailsId(appointmentId);

  // Drag-to-reschedule: move a card to a new day/slot, preserving its duration.
  // The cache is updated optimistically so the card lands instantly; the
  // mutation's success invalidation reconciles with the server, and a failure
  // rolls back to the snapshot.
  const handleAppointmentDrop = (
    appt: Appointment,
    day: Date,
    slotIndex: number,
  ) => {
    const newStart = slotToDate(day, slotIndex);
    const newStartIso = newStart.toISOString();
    if (newStartIso === appt.startAt) return; // dropped on its current slot

    const durationMs =
      new Date(appt.endAt).getTime() - new Date(appt.startAt).getTime();
    const newEndIso = new Date(newStart.getTime() + durationMs).toISOString();

    const snapshot = qc.getQueriesData<AppointmentsListResponse>({
      queryKey: appointmentKeys.all,
    });
    qc.setQueriesData<AppointmentsListResponse>(
      { queryKey: appointmentKeys.all },
      (old) =>
        old?.map((a) =>
          a.id === appt.id
            ? { ...a, startAt: newStartIso, endAt: newEndIso }
            : a,
        ),
    );

    const payload: ReschedulePayload & { id: string } = {
      id: appt.id,
      startAt: newStartIso,
      endAt: newEndIso,
    };
    if (appt.professionalId) payload.professionalId = appt.professionalId;

    reschedule(payload, {
      onSuccess: () => toast.success("Agendamento remarcado."),
      onError: (err) => {
        snapshot.forEach(([key, value]) => qc.setQueryData(key, value));
        toast.error(err.message);
      },
    });
  };

  // Hand off from the detail dialog to the reschedule dialog.
  const handleReschedule = (appointmentId: string) => {
    setDetailsId(null);
    setRescheduleId(appointmentId);
  };

  const viewProps = {
    currentDate,
    appointments,
    isLoading,
    onSlotClick: handleSlotClick,
    onAppointmentClick: handleAppointmentClick,
    onAppointmentDrop: handleAppointmentDrop,
  };

  return (
    <Section className="h-[calc(100svh-3.5rem)] gap-4 py-4">
      <PageHeader
        title="Agenda"
        description="Visualize e crie agendamentos da clínica."
      />

      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
        onViewModeChange={setViewMode}
      />

      {isError ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Não foi possível carregar a agenda.</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Tente novamente em instantes."}
            <button
              type="button"
              onClick={() => refetch()}
              className="font-medium underline underline-offset-4"
            >
              Tentar novamente
            </button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border">
          {viewMode === "week" ? (
            <WeekView {...viewProps} />
          ) : (
            <DayView {...viewProps} />
          )}
        </div>
      )}

      <AppointmentDialog
        start={slotStart}
        onClose={() => setSlotStart(null)}
      />

      <AppointmentDetailsDialog
        appointment={detailsAppointment}
        onClose={() => setDetailsId(null)}
        onReschedule={(appt) => handleReschedule(appt.id)}
      />

      <RescheduleDialog
        appointment={rescheduleAppointment}
        onClose={() => setRescheduleId(null)}
      />
    </Section>
  );
}
