import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// A match is mutual: I have repes the other user is missing AND
// they have repes I'm missing. Score rewards balanced cross-trades.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const me = session.user.id;

  const [allStickers, myRows] = await Promise.all([
    prisma.sticker.findMany({
      select: {
        id: true,
        code: true,
        number: true,
        teamCode: true,
        section: true,
        playerName: true,
        position: true,
      },
    }),
    prisma.userSticker.findMany({ where: { userId: me } }),
  ]);

  const stickerById = new Map(allStickers.map((s) => [s.id, s]));

  const myOwned = new Set<string>();
  const myRepes = new Set<string>();
  for (const r of myRows) {
    if (r.owned) myOwned.add(r.stickerId);
    if (r.owned && r.count > 1) myRepes.add(r.stickerId);
  }
  // I'm "missing" any sticker I don't own.
  const myMissing = new Set<string>();
  for (const s of allStickers) if (!myOwned.has(s.id)) myMissing.add(s.id);

  const others = await prisma.user.findMany({
    where: { id: { not: me } },
    select: {
      id: true,
      username: true,
      country: true,
      city: true,
      stickers: { select: { stickerId: true, owned: true, count: true } },
    },
  });

  const matches = others
    .map((u) => {
      const theirOwned = new Set<string>();
      const theirRepes = new Set<string>();
      for (const r of u.stickers) {
        if (r.owned) theirOwned.add(r.stickerId);
        if (r.owned && r.count > 1) theirRepes.add(r.stickerId);
      }

      // give = my repes that are in their missing.
      const give = Array.from(myRepes).filter(
        (stickerId) => !theirOwned.has(stickerId),
      );
      // get = their repes that are in my missing.
      const get = Array.from(theirRepes).filter((stickerId) =>
        myMissing.has(stickerId),
      );

      const giveCount = give.length;
      const getCount = get.length;
      const total = giveCount + getCount;
      // Balance bonus: equal trades feel best.
      const balance =
        Math.min(giveCount, getCount) /
        Math.max(1, Math.max(giveCount, getCount));
      // Score 0..100 — more trades + more balance = higher.
      const score = Math.min(
        100,
        Math.round(total * 6 + balance * 30),
      );

      return {
        user: {
          id: u.id,
          username: u.username,
          country: u.country,
          city: u.city,
        },
        give: give.slice(0, 8).map((id) => stickerById.get(id)),
        get: get.slice(0, 8).map((id) => stickerById.get(id)),
        giveCount,
        getCount,
        score,
      };
    })
    .filter((m) => m.giveCount > 0 && m.getCount > 0)
    .sort((a, b) => b.score - a.score);

  return NextResponse.json({ matches });
}
