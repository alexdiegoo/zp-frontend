import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { FunnelView } from "./view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("funnel") };
}

export default function FunnelPage() {
  return <FunnelView />;
}
