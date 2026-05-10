import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET  — returns pings I received (pending) + pings I sent
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const me = session.user.id;

  const [received, sent] = await Promise.all([
    prisma.matchPing.findMany({
      where: { toUserId: me },
      include: {
        from: { select: { id: true, username: true, country: true, city: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.matchPing.findMany({
      where: { fromUserId: me },
      select: { id: true, toUserId: true, status: true },
    }),
  ]);

  return NextResponse.json({ received, sent });
}

// POST  — create or re-send a ping to another user
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const me = session.user.id;

  const body = await req.json().catch(() => null);
  if (!body?.toUserId) {
    return NextResponse.json({ error: "toUserId required" }, { status: 400 });
  }
  if (body.toUserId === me) {
    return NextResponse.json({ error: "cannot ping yourself" }, { status: 400 });
  }

  const ping = await prisma.matchPing.upsert({
    where: { fromUserId_toUserId: { fromUserId: me, toUserId: body.toUserId } },
    create: { fromUserId: me, toUserId: body.toUserId, status: "pending" },
    update: { status: "pending", createdAt: new Date() },
  });

  return NextResponse.json(ping);
}
