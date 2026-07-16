import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LoginView } from "./view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("login.title") };
}

export default function LoginPage() {
  return <LoginView />;
}
