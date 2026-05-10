import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const schema = z.object({
  username: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y _"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  country: z.string().min(2).max(60),
  city: z.string().min(1).max(60),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const firstField = Object.keys(flat.fieldErrors)[0];
    const firstMsg = firstField
      ? flat.fieldErrors[firstField as keyof typeof flat.fieldErrors]?.[0]
      : "Datos inválidos";
    return NextResponse.json({ error: firstMsg ?? "Datos inválidos" }, { status: 400 });
  }

  const { username, email, password, country, city } = parsed.data;
  const emailLower = email.toLowerCase();

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: emailLower }, { username }] },
  });
  if (existing) {
    const conflict =
      existing.email === emailLower ? "El email ya está registrado" : "El usuario ya existe";
    return NextResponse.json({ error: conflict }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username,
      email: emailLower,
      passwordHash,
      country,
      city,
    },
    select: { id: true, username: true, email: true },
  });

  return NextResponse.json(user, { status: 201 });
}
