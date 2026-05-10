"use client";

import { useQuery } from "@tanstack/react-query";

export type MatchSticker = {
  id: string;
  code: string;
  number: number;
  teamCode: string;
  section: string;
  playerName: string | null;
  position: string | null;
};

export type PingInfo = {
  id: string;
  status: "pending_sent" | "pending_received" | "accepted" | "rejected_sent" | "rejected_received";
} | null;

export type Match = {
  user: {
    id: string;
    username: string;
    country: string | null;
    city: string | null;
    whatsapp: string | null;
  };
  give: MatchSticker[];
  get: MatchSticker[];
  giveCount: number;
  getCount: number;
  score: number;
  ping: PingInfo;
};

async function fetchMatches(): Promise<{ matches: Match[] }> {
  const res = await fetch("/api/matches");
  if (!res.ok) throw new Error("Failed to load matches");
  return res.json();
}

export function useMatches() {
  return useQuery({
    queryKey: ["matches"],
    queryFn: fetchMatches,
    refetchOnWindowFocus: true,
  });
}
