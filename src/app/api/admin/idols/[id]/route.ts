import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const params = await Promise.resolve(context.params);
    const body = await req.json();

    const updated = await prisma.deityIdol.update({
      where: { id: params.id },
      data: {
        name: body.name,
        receiptNo: body.receiptNo ? body.receiptNo.trim() : null,
        accessCode: body.accessCode ? body.accessCode.trim() : null,
        templeName: body.templeName || null,
        location: body.location || null,
        description: body.description || null,
        height: body.height || null,
        totalAmount: body.totalAmount !== undefined ? parseFloat(body.totalAmount) : undefined,
        advanceAmount: body.advanceAmount !== undefined ? parseFloat(body.advanceAmount) : undefined,
        status: body.status || "In progress",
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update idol" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const params = await Promise.resolve(context.params);
    await prisma.idolImage.deleteMany({ where: { idolId: params.id } });
    await prisma.deityIdol.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete" }, { status: 500 });
  }
}