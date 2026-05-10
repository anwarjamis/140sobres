import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH — accept or reject a received ping
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const status = body?.status;
  if (status !== "accepted" && status !== "rejected") {
    return NextResponse.json({ error: "status must be accepted or rejected" }, { status: 400 });
  }

  // Only the recipient can accept/reject
  const ping = await prisma.matchPing.findUnique({ where: { id: params.id } });
  if (!ping) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (ping.toUserId !== session.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const updated = await prisma.matchPing.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json(updated);
}
