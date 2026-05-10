"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AlbumData } from "@/lib/types";

type Args = {
  stickerId: string;
  owned?: boolean;
  count?: number;
};

export function useMarkSticker() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ stickerId, owned, count }: Args) => {
      const res = await fetch(`/api/album/${stickerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owned, count }),
      });
      if (!res.ok) throw new Error("Failed to update sticker");
      return res.json() as Promise<{
        stickerId: string;
        owned: boolean;
        count: number;
      }>;
    },

    // Optimistic update: flip the album cache immediately so the UI feels instant.
    onMutate: async ({ stickerId, owned, count }) => {
      await qc.cancelQueries({ queryKey: ["album"] });
      const prev = qc.getQueryData<AlbumData>(["album"]);
      if (prev) {
        qc.setQueryData<AlbumData>(["album"], {
          stickers: prev.stickers.map((s) => {
            if (s.id !== stickerId) return s;
            let nextOwned = owned ?? s.owned;
            let nextCount = count ?? s.count;
            if (nextOwned && nextCount === 0) nextCount = 1;
            if (!nextOwned) nextCount = 0;
            return { ...s, owned: nextOwned, count: nextCount };
          }),
        });
      }
      return { prev };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["album"], ctx.prev);
    },

    // Marking changes album, dupes, stats, AND matches (matches depend on
    // owned + dupes), so refetch all four.
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["album"] });
      qc.invalidateQueries({ queryKey: ["dupes"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}
