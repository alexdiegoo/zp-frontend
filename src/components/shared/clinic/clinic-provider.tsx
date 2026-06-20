"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import { readActiveClinicId, writeActiveClinicId } from "@/lib/clinic-tenant";
import type { Clinic } from "@/types/api";

type ClinicContextValue = {
  /** Every clinic the user owns. */
  clinics: Clinic[];
  /** The clinic currently scoping all data. */
  activeClinic: Clinic;
  /** Switch the active clinic; refetches every clinic-scoped query. */
  switchClinic: (clinicId: number) => void;
};

const ClinicContext = createContext<ClinicContextValue | null>(null);

/**
 * Holds the active clinic for the authenticated app. The selection is mirrored
 * into the `zapblast_clinic` cookie so the BFF (`resolveClinicId`) scopes every
 * request to the same tenant. Switching clinics invalidates the whole query
 * cache so all menus and features reflect the new clinic.
 *
 * Rendered only once clinics are known to be non-empty, so `clinics[0]` is safe.
 */
export function ClinicProvider({
  clinics,
  children,
}: {
  clinics: Clinic[];
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();

  const [activeId, setActiveId] = useState<number>(() => {
    const stored = readActiveClinicId();
    if (stored !== null && clinics.some((c) => c.id === stored)) return stored;
    return clinics[0].id;
  });

  // The stored clinic may have been deleted, or none was stored yet — fall back
  // to the first clinic (matching the server-side default in `resolveClinicId`).
  const activeClinic = useMemo(
    () => clinics.find((c) => c.id === activeId) ?? clinics[0],
    [clinics, activeId],
  );

  // Keep the cookie in sync with the resolved selection so the server agrees on
  // the very first request (e.g. when no cookie existed yet).
  useEffect(() => {
    writeActiveClinicId(activeClinic.id);
  }, [activeClinic.id]);

  const switchClinic = useCallback(
    (clinicId: number) => {
      if (clinicId === activeId) return;
      writeActiveClinicId(clinicId);
      setActiveId(clinicId);
      // All clinic-scoped data is resolved server-side from the cookie, so a
      // blanket invalidation refetches every feature against the new clinic.
      queryClient.invalidateQueries();
    },
    [activeId, queryClient],
  );

  const value = useMemo<ClinicContextValue>(
    () => ({ clinics, activeClinic, switchClinic }),
    [clinics, activeClinic, switchClinic],
  );

  return (
    <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>
  );
}

/** Access the active clinic and switcher. Must be used within `ClinicProvider`. */
export function useActiveClinic(): ClinicContextValue {
  const ctx = useContext(ClinicContext);
  if (!ctx) {
    throw new Error("useActiveClinic must be used within a ClinicProvider.");
  }
  return ctx;
}
