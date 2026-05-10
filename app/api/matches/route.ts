import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const me = session.user.id;

  const [allStickers, myRows, myPings] = await Promise.all([
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
    // pings I sent or received — to compute ping status per match
    prisma.matchPing.findMany({
      where: { OR: [{ fromUserId: me }, { toUserId: me }] },
      select: { id: true, fromUserId: true, toUserId: true, status: true },
    }),
  ]);

  const stickerById = new Map(allStickers.map((s) => [s.id, s]));

  const myOwned = new Set<string>();
  const myRepes = new Set<string>();
  for (const r of myRows) {
    if (r.owned) myOwned.add(r.stickerId);
    if (r.owned && r.count > 0) myRepes.add(r.stickerId);
  }
  const myMissing = new Set<string>();
  for (const s of allStickers) if (!myOwned.has(s.id)) myMissing.add(s.id);

  // Build ping lookup: otherUserId → ping info
  type PingStatus = "pending_sent" | "pending_received" | "accepted" | "rejected_sent" | "rejected_received";
  const pingByUser = new Map<string, { id: string; status: PingStatus }>();
  for (const p of myPings) {
    const otherUser = p.fromUserId === me ? p.toUserId : p.fromUserId;
    const iSent = p.fromUserId === me;
    let status: PingStatus;
    if (p.status === "pending") status = iSent ? "pending_sent" : "pending_received";
    else if (p.status === "accepted") status = "accepted";
    else status = iSent ? "rejected_sent" : "rejected_received";
    pingByUser.set(otherUser, { id: p.id, status });
  }

  const others = await prisma.user.findMany({
    where: { id: { not: me }, matchActive: true },
    select: {
      id: true,
      username: true,
      country: true,
      city: true,
      whatsapp: true,
      stickers: { select: { stickerId: true, owned: true, count: true } },
    },
  });

  const matches = others
    .map((u) => {
      const theirOwned = new Set<string>();
      const theirRepes = new Set<string>();
      for (const r of u.stickers) {
        if (r.owned) theirOwned.add(r.stickerId);
        if (r.owned && r.count > 0) theirRepes.add(r.stickerId);
      }

      const give = Array.from(myRepes).filter((id) => !theirOwned.has(id));
      const get = Array.from(theirRepes).filter((id) => myMissing.has(id));

      const giveCount = give.length;
      const getCount = get.length;
      const total = giveCount + getCount;
      const balance =
        Math.min(giveCount, getCount) /
        Math.max(1, Math.max(giveCount, getCount));
      const score = Math.min(100, Math.round(total * 6 + balance * 30));

      const ping = pingByUser.get(u.id) ?? null;
      const isAccepted = ping?.status === "accepted";

      return {
        user: {
          id: u.id,
          username: u.username,
          country: u.country,
          city: u.city,
          // only reveal whatsapp when both agreed
          whatsapp: isAccepted ? u.whatsapp : null,
        },
        give: give.slice(0, 8).map((id) => stickerById.get(id)),
        get: get.slice(0, 8).map((id) => stickerById.get(id)),
        giveCount,
        getCount,
        score,
        ping,
      };
    })
    .filter((m) => m.giveCount > 0 && m.getCount > 0)
    .sort((a, b) => b.score - a.score);

  return NextResponse.json({ matches });
}
