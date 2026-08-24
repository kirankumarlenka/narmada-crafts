import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const idols = await prisma.deityIdol.findMany({
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(idols);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { name, templeName, location, description } = await req.json();
  const idol = await prisma.deityIdol.create({
    data: { name, templeName, location, description },
  });

  return NextResponse.json(idol, { status: 201 });
}