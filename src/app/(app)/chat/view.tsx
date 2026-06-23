"use client";

import { useMemo, useState } from "react";
import { Loader2, MessageSquareDashed } from "lucide-react";
import { toast } from "sonner";

import { useDebounce } from "@/hooks/ui/use-debounce";
import {
  useChatChannels,
  useConversations,
  useMessages,
  useSendMessage,
} from "@/hooks/queries/use-chat";
import { ConversationSidebar } from "./_components/conversation-sidebar";
import { EmptyState } from "./_components/empty-state";
import { MessageThread } from "./_components/message-thread";

/**
 * Full-height WhatsApp chat: a fixed conversation list on the left and the
 * selected thread + composer on the right. Conversations and messages poll as
 * the realtime fallback; sending is optimistic.
 */
export function ChatView() {
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput.trim(), 350);

  const channelsQuery = useChatChannels();
  const channels = useMemo(() => channelsQuery.data ?? [], [channelsQuery.data]);

  // Derive the active channel (no effect): the explicit selection wins, else the
  // first available channel becomes the default.
  const channelId = selectedChannelId ?? channels[0]?.id ?? "";

  const conversationsQuery = useConversations({
    channelId,
    search: debouncedSearch.length > 0 ? debouncedSearch : undefined,
  });
  const conversations = useMemo(
    () => conversationsQuery.data ?? [],
    [conversationsQuery.data],
  );

  const selectedChannel = useMemo(
    () => channels.find((c) => c.id === channelId) ?? null,
    [channels, channelId],
  );

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.patientId === selectedPatientId) ?? null,
    [conversations, selectedPatientId],
  );

  const messagesQuery = useMessages({ channelId, patientId: selectedPatientId ?? "" });
  const sendMutation = useSendMessage({ channelId, patientId: selectedPatientId ?? "" });

  function handleSelectChannel(nextChannelId: string) {
    setSelectedChannelId(nextChannelId);
    setSelectedPatientId(null);
  }

  function handleSend(content: string) {
    sendMutation.mutate(content, {
      // Surface the backend message (e.g. a closed 24h window) when present; the
      // thread refetch on settle re-locks the composer if the window closed.
      onError: (error) =>
        toast.error(error instanceof Error ? error.message : "Não foi possível enviar a mensagem."),
    });
  }

  if (channelsQuery.isLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <MessageSquareDashed className="size-6" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-medium text-foreground">Nenhum canal conectado</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Conecte um canal de WhatsApp nas configurações para começar a atender conversas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      <ConversationSidebar
        channels={channels}
        selectedChannelId={channelId || null}
        onSelectChannel={handleSelectChannel}
        conversations={conversations}
        isLoading={conversationsQuery.isLoading}
        isError={conversationsQuery.isError}
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        selectedPatientId={selectedPatientId}
        onSelectConversation={setSelectedPatientId}
      />

      {selectedConversation && selectedChannel ? (
        <MessageThread
          conversation={selectedConversation}
          channel={selectedChannel}
          messages={messagesQuery.data?.data ?? []}
          windowStatus={messagesQuery.data?.windowStatus}
          isLoading={messagesQuery.isLoading}
          isError={messagesQuery.isError}
          isSending={sendMutation.isPending}
          onSend={handleSend}
        />
      ) : (
        <div className="flex min-w-0 flex-1 items-center justify-center bg-background">
          <EmptyState />
        </div>
      )}
    </div>
  );
}
