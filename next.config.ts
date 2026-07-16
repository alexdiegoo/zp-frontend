import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
};

// Points at `src/i18n/request.ts` by default (auto-detected under `src/`).
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
