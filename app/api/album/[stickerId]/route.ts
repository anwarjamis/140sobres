import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  owned: z.boolean().optional(),
  count: z.number().int().min(0).max(99).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { stickerId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const sticker = await prisma.sticker.findUnique({
    where: { id: params.stickerId },
    select: { id: true },
  });
  if (!sticker) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const existing = await prisma.userSticker.findUnique({
    where: {
      userId_stickerId: {
        userId: session.user.id,
        stickerId: params.stickerId,
      },
    },
  });

  let nextOwned = existing?.owned ?? false;
  let nextCount = existing?.count ?? 0;
  if (parsed.data.owned !== undefined) nextOwned = parsed.data.owned;
  if (parsed.data.count !== undefined) nextCount = parsed.data.count;
  // Only invariant: if not owned, no extras either.
  if (!nextOwned) nextCount = 0;

  const result = await prisma.userSticker.upsert({
    where: {
      userId_stickerId: {
        userId: session.user.id,
        stickerId: params.stickerId,
      },
    },
    create: {
      userId: session.user.id,
      stickerId: params.stickerId,
      owned: nextOwned,
      count: nextCount,
    },
    update: { owned: nextOwned, count: nextCount },
  });

  return NextResponse.json({
    stickerId: result.stickerId,
    owned: result.owned,
    count: result.count,
  });
}
