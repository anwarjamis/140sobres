"use client";

import { useQuery } from "@tanstack/react-query";

export type Me = {
  id: string;
  username: string;
  email: string;
  country: string | null;
  city: string | null;
  availableForSwap: boolean;
  matchActive: boolean;
  whatsapp: string | null;
  createdAt: string;
};

async function fetchMe(): Promise<Me> {
  const res = await fetch("/api/me");
  if (!res.ok) throw new Error("Error cargando perfil");
  return res.json();
}

export function useMe() {
  return useQuery<Me>({
    queryKey: ["me"],
    queryFn: fetchMe,
  });
}
