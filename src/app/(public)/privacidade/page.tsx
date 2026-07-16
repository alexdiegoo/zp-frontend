import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PrivacyPolicyView } from "./view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("public");
  return {
    title: t("meta.privacyTitle"),
    description: t("meta.privacyDescription"),
  };
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyView />;
}
