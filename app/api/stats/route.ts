import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const STICKERS_PER_PACK = 7;
const TOTAL = 980;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const me = session.user.id;

  const myRows = await prisma.userSticker.findMany({
    where: { userId: me },
    include: {
      sticker: {
        select: {
          id: true,
          code: true,
          number: true,
          teamCode: true,
          playerName: true,
          position: true,
          section: true,
        },
      },
    },
  });

  const owned = myRows.filter((r) => r.owned).length;
  const totalCopies = myRows.reduce((sum, r) => sum + r.count, 0);
  const sobresAbiertos = Math.max(
    1,
    Math.round(totalCopies / STICKERS_PER_PACK),
  );

  const dupesCount = myRows
    .filter((r) => r.count > 1)
    .reduce((sum, r) => sum + (r.count - 1), 0);

  // Naive projection: how many more packs to complete the album, given the
  // user's current "luck" rate of unique-per-pack.
  const uniquePerPack = sobresAbiertos > 0 ? owned / sobresAbiertos : 0.5;
  const remaining = TOTAL - owned;
  const projectedPacks =
    uniquePerPack > 0 ? Math.round(remaining / uniquePerPack) : remaining;
  const idealPacks = 140;
  const ratio =
    sobresAbiertos + projectedPacks > 0
      ? (sobresAbiertos + projectedPacks) / idealPacks
      : 1;

  // Top 5 most duplicated.
  const masCargas = myRows
    .filter((r) => r.count > 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((r) => ({
      stickerId: r.sticker.id,
      code: r.sticker.code,
      teamCode: r.sticker.teamCode,
      number: r.sticker.number,
      playerName: r.sticker.playerName,
      count: r.count,
    }));

  // Stickers I'm missing — use as a stand-in for "rarest" until we have
  // community data. Show 4 random missing ones with mock community %.
  const myStickerIds = new Set(myRows.filter((r) => r.owned).map((r) => r.stickerId));
  const allStickers = await prisma.sticker.findMany({
    where: { section: "COUNTRY" },
    select: {
      id: true,
      code: true,
      teamCode: true,
      number: true,
      playerName: true,
    },
  });
  const missingPool = allStickers.filter((s) => !myStickerIds.has(s.id));
  const masRaras = missingPool.slice(0, 4).map((s, i) => ({
    stickerId: s.id,
    code: s.code,
    teamCode: s.teamCode,
    number: s.number,
    playerName: s.playerName,
    rarity: 2.1 + i * 1.5, // placeholder community rarity %
  }));

  return NextResponse.json({
    owned,
    total: TOTAL,
    sobresAbiertos,
    racha: 0, // TODO: needs daily activity tracking
    cambios: 0, // TODO: needs swap history
    projectedPacks,
    idealPacks,
    ratio: Math.round(ratio * 10) / 10,
    progressFraction: Math.min(
      1,
      sobresAbiertos / Math.max(1, sobresAbiertos + projectedPacks),
    ),
    dupesCount,
    masCargas,
    masRaras,
    // 30-day activity heatmap — all zeros until we track marks per day.
    heatmap: Array.from({ length: 30 }, () => 0),
  });
}
