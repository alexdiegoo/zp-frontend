import { useQuery } from "@tanstack/react-query";

import { getData } from "@/lib/api/http";
import type { WaPhoneNumber } from "@/types/api";

export const waPhoneNumberKeys = {
  all: ["wa-phone-numbers"] as const,
};

/**
 * Lists the clinic's official (Meta) WhatsApp sender numbers for the campaign
 * builder. Returns the raw array (the BFF unwraps the backend `{ data }`).
 */
export function useWaPhoneNumbers(enabled = true) {
  return useQuery({
    queryKey: waPhoneNumberKeys.all,
    queryFn: () => getData<WaPhoneNumber[]>("/api/wa-phone-numbers"),
    enabled,
    staleTime: 1000 * 60,
  });
}
