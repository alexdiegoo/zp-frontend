import { MessageSquare } from "lucide-react";

/** Placeholder shown in the right pane when no conversation is selected. */
export function EmptyState({
  title = "Selecione uma conversa",
  description = "Escolha um paciente à esquerda para ver e responder as mensagens.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <MessageSquare className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-medium text-foreground">{title}</p>
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
