"use client";

import { useMemo } from "react";

import { getWeekDays } from "@/lib/calendar";
import type { Appointment } from "@/types/api";
import { TimeGrid } from "./time-grid";

interface WeekViewProps {
  currentDate: Date;
  appointments: Appointment[];
  isLoading?: boolean;
  onSlotClick: (day: Date, slotIndex: number) => void;
  onAppointmentClick: (appointmentId: string) => void;
  onAppointmentDrop: (appt: Appointment, day: Date, slotIndex: number) => void;
}

/** Week grid: the seven days (Sun–Sat) around `currentDate`. */
export function WeekView({ currentDate, ...rest }: WeekViewProps) {
  const days = useMemo(() => getWeekDays(currentDate), [currentDate]);
  return <TimeGrid days={days} {...rest} />;
}
