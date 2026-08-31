import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

// Public: Submit a new booking inquiry
export async function POST(req: Request) {
  try {
    const {
      customerName,
      phone,
      email,
      idolType,
      height,
      templeName,
      location,
      notes,
    } = await req.json();

    if (!customerName || !phone || !idolType) {
      return NextResponse.json(
        { error: "Customer Name, Phone number, and Idol Type are required." },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        idolType: idolType.trim(),
        height: height?.trim() || null,
        templeName: templeName?.trim() || null,
        location: location?.trim() || null,
        notes: notes?.trim() || null,
        status: "Pending",
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error("Booking submission error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to submit booking" },
      { status: 500 }
    );
  }
}

// Admin: Fetch all bookings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}