import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { getData, postData, sendData } from "@/lib/api/http";
import type {
  CreateAppointmentPayload,
  ReschedulePayload,
  UpdateAppointmentStatusPayload,
} from "@/lib/validations/appointment";
import type { Appointment, AppointmentsListResponse } from "@/types/api";

/** ISO date-window the calendar fetches (derived from the visible week/day). */
export type AppointmentsParams = {
  startAt: string;
  endAt: string;
};

export const appointmentKeys = {
  all: ["appointments"] as const,
  list: (params: AppointmentsParams) =>
    [...appointmentKeys.all, "list", params] as const,
};

/** Appointments within a date window, refetched whenever the window changes. */
export function useAppointments(params: AppointmentsParams) {
  const search = new URLSearchParams({
    startAt: params.startAt,
    endAt: params.endAt,
  });

  return useQuery({
    queryKey: appointmentKeys.list(params),
    queryFn: () =>
      getData<AppointmentsListResponse>(`/api/appointments?${search}`),
    // Keep the current week visible while the next window loads — avoids flicker.
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  });
}

/** Creates an appointment, then invalidates every calendar window. */
export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAppointmentPayload) =>
      postData<Appointment>(
        "/api/appointments",
        payload,
        "Não foi possível criar o agendamento.",
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

/** Updates an appointment's status (e.g. mark as DONE), then refreshes the calendar. */
export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: UpdateAppointmentStatusPayload & { id: string }) =>
      sendData<Appointment>(
        `/api/appointments/${id}/status`,
        "PATCH",
        payload,
        "Não foi possível atualizar o agendamento.",
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

/** Reschedules an appointment (new date/time, optional professional). */
export function useRescheduleAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: ReschedulePayload & { id: string }) =>
      sendData<Appointment>(
        `/api/appointments/${id}/reschedule`,
        "PATCH",
        payload,
        "Não foi possível reagendar o agendamento.",
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

/** Cancels an appointment (status → CANCELLED), then refreshes the calendar. */
export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      sendData<null>(
        `/api/appointments/${id}`,
        "DELETE",
        undefined,
        "Não foi possível cancelar o agendamento.",
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}
