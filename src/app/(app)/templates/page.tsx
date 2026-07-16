import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { TemplatesView } from "./view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("templates");
  return { title: t("title") };
}

export default function TemplatesPage() {
  return (
    <Suspense>
      <TemplatesView />
    </Suspense>
  );
}
