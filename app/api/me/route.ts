import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      email: true,
      country: true,
      city: true,
      availableForSwap: true,
      matchActive: true,
      whatsapp: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const data: Record<string, unknown> = {};

  if (body.availableForSwap !== undefined) {
    data.availableForSwap = Boolean(body.availableForSwap);
  }
  if (body.matchActive !== undefined) {
    data.matchActive = Boolean(body.matchActive);
  }
  if (body.whatsapp !== undefined) {
    data.whatsapp = body.whatsapp ? String(body.whatsapp).trim() : null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { availableForSwap: true, matchActive: true, whatsapp: true },
  });

  return NextResponse.json(user);
}
