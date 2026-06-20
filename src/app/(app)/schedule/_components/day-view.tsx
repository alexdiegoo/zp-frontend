"use client";

import { useMemo } from "react";

import { startOfDay } from "@/lib/calendar";
import type { Appointment } from "@/types/api";
import { TimeGrid } from "./time-grid";

interface DayViewProps {
  currentDate: Date;
  appointments: Appointment[];
  isLoading?: boolean;
  onSlotClick: (day: Date, slotIndex: number) => void;
  onAppointmentClick: (appointmentId: string) => void;
  onAppointmentDrop: (appt: Appointment, day: Date, slotIndex: number) => void;
}

/** Day grid: a single column for `currentDate`. */
export function DayView({ currentDate, ...rest }: DayViewProps) {
  const days = useMemo(() => [startOfDay(currentDate)], [currentDate]);
  return <TimeGrid days={days} {...rest} />;
}
