import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { accessCode } = await req.json();

    if (!accessCode || typeof accessCode !== "string") {
      return NextResponse.json({ error: "Passcode is required" }, { status: 400 });
    }

    const trimmedCode = accessCode.trim();

    // Find idol by case-insensitive accessCode
    const idol = await prisma.deityIdol.findFirst({
      where: {
        accessCode: {
          equals: trimmedCode,
          mode: "insensitive",
        },
      },
      include: {
        images: true,
      },
    });

    if (!idol) {
      return NextResponse.json(
        { error: `No idol found for passcode: "${trimmedCode}"` },
        { status: 404 }
      );
    }

    return NextResponse.json(idol);
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error during verification" },
      { status: 500 }
    );
  }
}