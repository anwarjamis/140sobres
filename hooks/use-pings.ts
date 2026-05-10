"use client";

import { useQuery } from "@tanstack/react-query";

export type PingStatus = "pending" | "accepted" | "rejected";

export type ReceivedPing = {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: PingStatus;
  createdAt: string;
  from: {
    id: string;
    username: string;
    country: string | null;
    city: string | null;
  };
};

export type SentPing = {
  id: string;
  toUserId: string;
  status: PingStatus;
};

export type PingsData = {
  received: ReceivedPing[];
  sent: SentPing[];
};

async function fetchPings(): Promise<PingsData> {
  const res = await fetch("/api/pings");
  if (!res.ok) throw new Error("Error cargando solicitudes");
  return res.json();
}

export function usePings() {
  return useQuery<PingsData>({
    queryKey: ["pings"],
    queryFn: fetchPings,
  });
}
