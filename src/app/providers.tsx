"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { handleUnauthorized } from "@/lib/api/http";

function makeQueryClient() {
  return new QueryClient({
    // A 401 from any query or mutation means the session expired — log the user
    // out and redirect to login from a single place (see `handleUnauthorized`).
    queryCache: new QueryCache({ onError: handleUnauthorized }),
    mutationCache: new MutationCache({ onError: handleUnauthorized }),
    defaultOptions: {
      queries: {
        // Avoid refetching immediately on the client after SSR/hydration.
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new client.
    return makeQueryClient();
  }
  // Browser: reuse a singleton so React doesn't discard it on re-render.
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
