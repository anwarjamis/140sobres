"use client";

import { useQuery } from "@tanstack/react-query";

export type StatsData = {
  owned: number;
  total: number;
  totalUsers: number;
  sobresAbiertos: number;
  projectedPacks: number;
  idealPacks: number;
  progressFraction: number;
  dupesCount: number;
  masCargas: Array<{
    stickerId: string;
    code: string;
    teamCode: string;
    number: number;
    playerName: string | null;
    count: number;
  }>;
  masRaras: Array<{
    stickerId: string;
    code: string;
    teamCode: string;
    number: number;
    playerName: string | null;
    rarity: number;
    ownerCount: number;
  }>;
  heatmap: number[];
};

async function fetchStats(): Promise<StatsData> {
  const res = await fetch("/api/stats");
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    refetchInterval: 5 * 60 * 1000,
  });
}
