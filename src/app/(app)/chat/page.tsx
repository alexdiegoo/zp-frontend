import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ChatView } from "./view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("chat") };
}

export default function ChatPage() {
  return <ChatView />;
}
