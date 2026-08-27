import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET() {
  const idols = await prisma.deityIdol.findMany({
    include: {
      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(idols);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const {
      name,
      templeName,
      location,
      description,
      accessCode,
      height,
      totalAmount,
      advanceAmount,
      status,
    } = await req.json();

    const idol = await prisma.deityIdol.create({
      data: {
        name,
        templeName: templeName || null,
        location: location || null,
        description: description || null,
        accessCode: accessCode?.trim() || null,
        height: height || null,
        totalAmount: totalAmount ? parseFloat(totalAmount) : 0,
        advanceAmount: advanceAmount ? parseFloat(advanceAmount) : 0,
        status: status || "In progress",
      },
    });

    return NextResponse.json(idol, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}