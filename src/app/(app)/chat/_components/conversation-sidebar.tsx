"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ChatChannel, Conversation } from "@/types/chat";
import { ConversationItem } from "./conversation-item";

/** Left pane: channel selector, patient search and the conversation list. */
export function ConversationSidebar({
  channels,
  selectedChannelId,
  onSelectChannel,
  conversations,
  isLoading,
  isError,
  searchQuery,
  onSearchChange,
  selectedPatientId,
  onSelectConversation,
}: {
  channels: ChatChannel[];
  selectedChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
  conversations: Conversation[];
  isLoading: boolean;
  isError: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedPatientId: string | null;
  onSelectConversation: (patientId: string) => void;
}) {
  return (
    <aside className="flex h-full w-full max-w-[320px] shrink-0 flex-col border-r border-border bg-card">
      <div className="space-y-3 border-b border-border p-3">
        {channels.length > 1 && (
          <Select
            value={selectedChannelId ?? undefined}
            onValueChange={onSelectChannel}
          >
            <SelectTrigger className="w-full" size="sm">
              <SelectValue placeholder="Selecione um canal" />
            </SelectTrigger>
            <SelectContent>
              {channels.map((channel) => (
                <SelectItem key={channel.id} value={channel.id}>
                  {channel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar paciente"
            className="pl-9"
            aria-label="Buscar paciente"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <SidebarSkeleton />
        ) : isError ? (
          <p className="p-4 text-sm text-muted-foreground">
            Não foi possível carregar as conversas.
          </p>
        ) : conversations.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            {searchQuery.trim().length > 0
              ? "Nenhum paciente encontrado."
              : "Nenhum paciente cadastrado."}
          </p>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.patientId}
              conversation={conversation}
              isActive={conversation.patientId === selectedPatientId}
              onSelect={() => onSelectConversation(conversation.patientId)}
            />
          ))
        )}
      </div>
    </aside>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-1 p-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 py-2">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
