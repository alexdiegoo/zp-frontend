import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { NewTemplateView } from "./view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("templates");
  return { title: t("new.title") };
}

export default function NewTemplatePage() {
  return <NewTemplateView />;
}
