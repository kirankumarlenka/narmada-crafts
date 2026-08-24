import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Resolves params across all Next.js versions
    const params = await Promise.resolve(context.params);
    const idolId = params.id;

    if (!idolId) {
      return NextResponse.json({ error: "Missing Idol ID" }, { status: 400 });
    }

    const body = await req.json();
    const { url, caption, occasion, isPrimary } = body;

    if (!url) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    if (isPrimary) {
      await prisma.idolImage.updateMany({
        where: { idolId },
        data: { isPrimary: false },
      });
    }

    const image = await prisma.idolImage.create({
      data: {
        url,
        caption: caption || null,
        occasion: occasion || null,
        isPrimary: Boolean(isPrimary),
        idolId,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error: any) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save image" },
      { status: 500 }
    );
  }
}