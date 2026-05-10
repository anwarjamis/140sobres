import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Fetch ALL stickers + the user's UserSticker rows in a single query.
  const stickers = await prisma.sticker.findMany({
    orderBy: [{ section: "asc" }, { teamCode: "asc" }, { number: "asc" }],
    include: {
      users: {
        where: { userId: session.user.id },
        select: { owned: true, count: true },
      },
    },
  });

  const data = stickers.map((s) => ({
    id: s.id,
    code: s.code,
    number: s.number,
    section: s.section,
    teamCode: s.teamCode,
    group: s.group,
    playerName: s.playerName,
    position: s.position,
    owned: s.users[0]?.owned ?? false,
    count: s.users[0]?.count ?? 0,
  }));

  return NextResponse.json({ stickers: data });
}
