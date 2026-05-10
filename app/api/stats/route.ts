import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const STICKERS_PER_PACK = 7;
const TOTAL = 980;
const IDEAL_PACKS = 140;

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

  // owned = stickers pegadas en el álbum
  const owned = myRows.filter((r) => r.owned).length;

  // dupesCount = suma de todas las repetidas (count ya es solo el extra)
  const dupesCount = myRows
    .filter((r) => r.count > 0)
    .reduce((sum, r) => sum + r.count, 0);

  // sobresAbiertos = (pegadas + repetidas) / 7
  const sobresAbiertos = Math.round((owned + dupesCount) / STICKERS_PER_PACK);

  // % del álbum completado
  const progressFraction = owned / TOTAL;

  // Mínimos sobres para completar = 140 − sobres abiertos (con suerte perfecta)
  const projectedPacks = Math.max(0, IDEAL_PACKS - sobresAbiertos);

  // Top 5 stickers con más copias extra
  const masCargas = myRows
    .filter((r) => r.count > 0)
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

  // Láminas que más le faltan al usuario (las primeras del listado de no-pegadas)
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
    rarity: 2.1 + i * 1.5,
  }));

  return NextResponse.json({
    owned,
    total: TOTAL,
    sobresAbiertos,
    dupesCount,
    progressFraction,
    projectedPacks,
    idealPacks: IDEAL_PACKS,
    masCargas,
    masRaras,
    heatmap: Array.from({ length: 30 }, () => 0),
  });
}
