// Shared client-facing types.

export type AlbumSticker = {
  id: string;
  code: string;
  number: number;
  section: "SPECIAL" | "FWC" | "COUNTRY";
  teamCode: string;
  group: string | null;
  playerName: string | null;
  position: string | null;
  owned: boolean;
  count: number;
};

export type AlbumData = {
  stickers: AlbumSticker[];
};
