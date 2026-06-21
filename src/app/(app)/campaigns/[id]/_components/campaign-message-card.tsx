"use client";

import { useState } from "react";
import { Check, Copy, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

/**
 * Unofficial-campaign message panel: the tracked text the operator copies and
 * sends by hand. Mirrors the post-creation success screen so the message stays
 * available from the campaign's detail page too.
 */
export function CampaignMessageCard({ message }: { message: string }) {
  const [copied, setCopied] = useState(false);

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — the textarea allows manual copy.
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mensagem para disparar</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-700 dark:text-amber-400">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            Esta campanha usa a API não oficial e requer envio manual. Não
            altere o texto para preservar o rastreamento.
          </p>
        </div>

        <Textarea
          readOnly
          rows={8}
          value={message}
          aria-label="Mensagem com rastreamento"
          className="bg-muted/40"
        />

        <div className="flex justify-end">
          <Button type="button" onClick={copyMessage}>
            {copied ? <Check /> : <Copy />}
            {copied ? "Copiado!" : "Copiar mensagem"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
