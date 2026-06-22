import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { getData, postData } from "@/lib/api/http";
import type { SendMessageDto } from "@/lib/validations/chat";
import type {
  ChatChannel,
  ChatMessage,
  Conversation,
  MessagesPage,
} from "@/types/chat";

/** Params identifying a conversation thread. */
export type ConversationThread = {
  channelId: string;
  patientId: string;
};

export const chatKeys = {
  all: ["chat"] as const,
  channels: () => [...chatKeys.all, "channels"] as const,
  conversations: (params: { channelId: string; search?: string }) =>
    [...chatKeys.all, "conversations", params] as const,
  messages: (params: ConversationThread) =>
    [...chatKeys.all, "messages", params] as const,
};

/** Lists the clinic's WhatsApp channels usable in chat. */
export function useChatChannels() {
  return useQuery({
    queryKey: chatKeys.channels(),
    queryFn: () => getData<ChatChannel[]>("/api/chat/channels"),
    staleTime: 1000 * 60,
  });
}

/** Lists conversations for a channel, optionally filtered by name/phone. */
export function useConversations(params: { channelId: string; search?: string }) {
  const search = new URLSearchParams({ channelId: params.channelId });
  if (params.search) search.set("search", params.search);

  return useQuery({
    queryKey: chatKeys.conversations(params),
    queryFn: () =>
      getData<Conversation[]>(`/api/chat/conversations?${search}`),
    enabled: params.channelId.length > 0,
    // Conversation order changes as new messages arrive — keep it reasonably fresh.
    refetchInterval: 1000 * 10,
    staleTime: 1000 * 5,
  });
}

/**
 * Paginated message thread for the selected conversation. Polls every 5s as the
 * realtime fallback until SSE/WS lands.
 */
export function useMessages(params: ConversationThread) {
  const enabled = params.patientId.length > 0 && params.channelId.length > 0;
  const search = new URLSearchParams({ channelId: params.channelId });

  return useQuery({
    queryKey: chatKeys.messages(params),
    queryFn: () =>
      getData<MessagesPage>(
        `/api/chat/conversations/${params.patientId}/messages?${search}`,
      ),
    enabled,
    refetchInterval: 1000 * 5,
    staleTime: 1000 * 2,
  });
}

/**
 * Sends a message with an optimistic PENDING bubble. On error the optimistic
 * message is rolled back; on settle the thread + conversation list refetch.
 */
export function useSendMessage(params: ConversationThread) {
  const qc = useQueryClient();
  const messagesKey = chatKeys.messages(params);

  return useMutation({
    mutationFn: (content: string) =>
      postData<ChatMessage>(
        `/api/chat/conversations/${params.patientId}/messages`,
        { channelId: params.channelId, content } satisfies SendMessageDto,
        "Não foi possível enviar a mensagem.",
      ),
    onMutate: async (content: string) => {
      await qc.cancelQueries({ queryKey: messagesKey });
      const previous = qc.getQueryData<MessagesPage>(messagesKey);

      const optimistic: ChatMessage = {
        bodyText: content,
        direction: "OUTBOUND",
        id: `optimistic-${Date.now()}`,
        messageType: "conversation",
        occurredAt: new Date().toISOString(),
        providerMessageId: "",
        status: "PENDING",
      };

      qc.setQueryData<MessagesPage>(messagesKey, (current) => {
        const base: MessagesPage =
          current ?? { data: [], limit: 30, page: 1, total: 0, totalPages: 1 };
        return {
          ...base,
          data: [...base.data, optimistic],
          total: base.total + 1,
        };
      });

      return { previous };
    },
    onError: (_error, _content, context) => {
      if (context?.previous) {
        qc.setQueryData(messagesKey, context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: messagesKey });
      qc.invalidateQueries({ queryKey: [...chatKeys.all, "conversations"] });
    },
  });
}
