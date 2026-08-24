import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ imageId: string }> | { imageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const params = await Promise.resolve(context.params);
    const imageId = params.imageId;

    await prisma.idolImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete image" },
      { status: 500 }
    );
  }
}