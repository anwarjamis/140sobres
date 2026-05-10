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

  const [myRows, totalUsers] = await Promise.all([
    prisma.userSticker.findMany({
      where: { userId: me },
      include: {
        sticker: {
          select: {
            id: true,
            code: true,
            number: true,
            teamCode: true,
            playerName: true,
            section: true,
          },
        },
      },
    }),
    prisma.user.count(),
  ]);

  // ---- mis números ----
  const owned = myRows.filter((r) => r.owned).length;
  const dupesCount = myRows.filter((r) => r.count > 0).reduce((s, r) => s + r.count, 0);
  const sobresAbiertos = Math.round((owned + dupesCount) / STICKERS_PER_PACK);
  const progressFraction = owned / TOTAL;
  const projectedPacks = Math.max(0, IDEAL_PACKS - sobresAbiertos);

  // ---- actividad · últimos 30 días ----
  // updatedAt refleja la última vez que la fila cambió (marcado/desmarcado/repe)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentOwned = myRows.filter(
    (r) => r.owned && r.updatedAt >= thirtyDaysAgo,
  );
  const heatmap = Array<number>(30).fill(0);
  for (const r of recentOwned) {
    const daysAgo = Math.floor(
      (Date.now() - r.updatedAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysAgo >= 0 && daysAgo < 30) heatmap[29 - daysAgo]++;
  }

  // ---- las más raras: % de usuarios que la tienen (comunidad) ----
  // Pedir top-10 stickers con menos dueños; mostrar 4
  const ownedCounts = await prisma.userSticker.groupBy({
    by: ["stickerId"],
    where: { owned: true },
    _count: { stickerId: true },
    orderBy: { _count: { stickerId: "asc" } },
    take: 20,
  });

  // Enriquecer con datos del sticker
  const rareIds = ownedCounts.map((r) => r.stickerId);
  const rareStickerData = await prisma.sticker.findMany({
    where: { id: { in: rareIds } },
    select: { id: true, code: true, teamCode: true, number: true, playerName: true },
  });
  const rareStickerMap = new Map(rareStickerData.map((s) => [s.id, s]));

  const masRaras = ownedCounts
    .map((r) => {
      const s = rareStickerMap.get(r.stickerId);
      if (!s) return null;
      return {
        stickerId: s.id,
        code: s.code,
        teamCode: s.teamCode,
        number: s.number,
        playerName: s.playerName,
        ownerCount: r._count.stickerId,
        rarity: Math.round((r._count.stickerId / totalUsers) * 100),
      };
    })
    .filter(Boolean)
    .slice(0, 4);

  // ---- las que más salen: suma de extras en toda la comunidad ----
  const topDupesRaw = await prisma.userSticker.groupBy({
    by: ["stickerId"],
    where: { count: { gt: 0 } },
    _sum: { count: true },
    orderBy: { _sum: { count: "desc" } },
    take: 5,
  });

  const topIds = topDupesRaw.map((r) => r.stickerId);
  const topStickerData = await prisma.sticker.findMany({
    where: { id: { in: topIds } },
    select: { id: true, code: true, teamCode: true, number: true, playerName: true },
  });
  const topStickerMap = new Map(topStickerData.map((s) => [s.id, s]));

  const masCargas = topDupesRaw
    .map((r) => {
      const s = topStickerMap.get(r.stickerId);
      if (!s) return null;
      return {
        stickerId: s.id,
        code: s.code,
        teamCode: s.teamCode,
        number: s.number,
        playerName: s.playerName,
        count: r._sum.count ?? 0,
      };
    })
    .filter(Boolean);

  return NextResponse.json({
    owned,
    total: TOTAL,
    totalUsers,
    sobresAbiertos,
    dupesCount,
    progressFraction,
    projectedPacks,
    idealPacks: IDEAL_PACKS,
    masCargas,
    masRaras,
    heatmap,
  });
}
