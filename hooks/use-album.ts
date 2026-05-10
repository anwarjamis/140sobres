"use client";

import { useQuery } from "@tanstack/react-query";
import type { AlbumData } from "@/lib/types";

async function fetchAlbum(): Promise<AlbumData> {
  const res = await fetch("/api/album");
  if (!res.ok) throw new Error("Failed to load album");
  return res.json();
}

export function useAlbum() {
  return useQuery({
    queryKey: ["album"],
    queryFn: fetchAlbum,
  });
}
