import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");
  return {
    title: {
      default: "ZapBlast",
      template: "%s · ZapBlast",
    },
    description: t("appDescription"),
  };
}

// Mobile-first viewport. `width=device-width` + `initialScale: 1` keep the
// layout at device width; user scaling is intentionally left enabled for
// accessibility (WCAG 1.4.4 / 1.4.10) — do not set maximumScale/userScalable.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Rendered in a Server Component, the provider inherits the request's
            locale, messages, and formats — Client Components resolve keys
            without a client-side fetch. */}
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
          <Toaster richColors position="top-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
