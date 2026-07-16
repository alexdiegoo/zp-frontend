import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LandingView } from "./view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("public");
  return {
    title: t("meta.homeTitle"),
    description: t("meta.homeDescription"),
  };
}

export default function LandingPage() {
  return <LandingView />;
}
