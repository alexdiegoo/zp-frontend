import type { ReactElement, ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";

import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { formats } from "@/i18n/request";
import ptBRMessages from "../../messages/pt-BR.json";

/**
 * A fresh QueryClient per test with retries disabled, so query hooks resolve
 * against test-provided data instead of retrying failed (mocked) requests.
 */
function makeTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

type ProviderOptions = Omit<RenderOptions, "wrapper"> & {
  /** Active locale for the test (defaults to the app default, `pt-BR`). */
  locale?: Locale;
  /** Message catalog to resolve keys against (defaults to the pt-BR catalog). */
  messages?: AbstractIntlMessages;
};

/**
 * Renders `ui` wrapped in the providers a client component expects — an
 * isolated QueryClient plus a `NextIntlClientProvider` so `useTranslations`/
 * `useFormatter` resolve without the network. Pass `locale`/`messages` to test
 * a specific language or a focused fixture catalog.
 */
export function renderWithProviders(
  ui: ReactElement,
  { locale = DEFAULT_LOCALE, messages = ptBRMessages, ...options }: ProviderOptions = {},
) {
  const queryClient = makeTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        formats={formats}
      >
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </NextIntlClientProvider>
    );
  }

  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}

// Re-export the RTL surface so tests import everything from one place.
export * from "@testing-library/react";
