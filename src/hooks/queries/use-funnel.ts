import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getData, sendData } from "@/lib/api/http";
import { FUNNEL_STAGES } from "@/lib/validations/funnel";
import type { FunnelBoard, FunnelCard, FunnelStage } from "@/types/api";

/** Query key factory for cache management. */
export const funnelKeys = {
  all: ["funnel"] as const,
  board: () => [...funnelKeys.all, "board"] as const,
};

/** Empty board used as a placeholder and optimistic-update base. */
function emptyBoard(): FunnelBoard {
  return {
    LEAD: [],
    FOLLOW_UP: [],
    APPOINTMENT_SCHEDULED: [],
    PROCEDURE_DONE: [],
  };
}

/** The active clinic's funnel board, grouped by stage. */
export function useFunnelBoard() {
  return useQuery({
    queryKey: funnelKeys.board(),
    queryFn: () =>
      getData<FunnelBoard>("/api/funnel", "Não foi possível carregar o funil."),
    staleTime: 1000 * 30,
  });
}

type MoveCardVariables = {
  entryId: string;
  stage: FunnelStage;
  sort_order?: number;
};

type MoveCardContext = {
  previous?: FunnelBoard;
};

/**
 * Moves a card to a new stage with an optimistic update: the card is relocated
 * in the cache immediately, rolled back on error and reconciled with the server
 * on settle.
 */
export function useMoveFunnelCard() {
  const queryClient = useQueryClient();

  return useMutation<FunnelCard | null, Error, MoveCardVariables, MoveCardContext>({
    mutationFn: ({ entryId, stage, sort_order }) =>
      sendData<FunnelCard>(`/api/funnel/${entryId}/move`, "PATCH", {
        stage,
        sort_order,
      }),

    onMutate: async ({ entryId, stage }) => {
      await queryClient.cancelQueries({ queryKey: funnelKeys.board() });
      const previous = queryClient.getQueryData<FunnelBoard>(funnelKeys.board());

      queryClient.setQueryData<FunnelBoard>(funnelKeys.board(), (old) => {
        if (!old) return old;

        const next: FunnelBoard = { ...emptyBoard() };
        for (const s of FUNNEL_STAGES) next[s] = [...old[s]];

        let moved: FunnelCard | undefined;
        for (const s of FUNNEL_STAGES) {
          const idx = next[s].findIndex((card) => card.id === entryId);
          if (idx !== -1) {
            moved = { ...next[s][idx], stage };
            next[s] = next[s].filter((card) => card.id !== entryId);
            break;
          }
        }

        if (moved) next[stage] = [...next[stage], moved];
        return next;
      });

      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(funnelKeys.board(), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: funnelKeys.board() });
    },
  });
}
