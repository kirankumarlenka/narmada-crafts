import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const idols = await prisma.deityIdol.findMany({
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });

    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
    });

    const idolsSheetData = idols.map((item) => {
      const total = item.totalAmount || 0;
      const advance = item.advanceAmount || 0;
      return {
        "Deity Name": item.name,
        "Receipt No": item.receiptNo || "N/A",
        "Security Passcode": item.accessCode || "N/A",
        "Height": item.height || "N/A",
        "Temple Name": item.templeName || "N/A",
        "Location": item.location || "N/A",
        "Order Status": item.status || "In progress",
        "Total (INR)": total,
        "Advance (INR)": advance,
        "Balance (INR)": Math.max(0, total - advance),
        "Total Photos": item.images.length,
        "Created Date": new Date(item.createdAt).toISOString().split("T")[0],
        "Description": item.description || "",
      };
    });

    const bookingsSheetData = bookings.map((b) => ({
      "Customer Name": b.customerName,
      "Phone": b.phone,
      "Email": b.email || "N/A",
      "Requested Idol": b.idolType,
      "Height": b.height || "N/A",
      "Temple/Ashram": b.templeName || "N/A",
      "Location": b.location || "N/A",
      "Inquiry Status": b.status,
      "Created Date": new Date(b.createdAt).toISOString().split("T")[0],
      "Notes": b.notes || "",
    }));

    const workbook = XLSX.utils.book_new();

    const idolWorksheet = XLSX.utils.json_to_sheet(idolsSheetData);
    XLSX.utils.book_append_sheet(workbook, idolWorksheet, "Deity Orders");

    const bookingWorksheet = XLSX.utils.json_to_sheet(bookingsSheetData);
    XLSX.utils.book_append_sheet(workbook, bookingWorksheet, "Customer Inquiries");

    // Output binary string and wrap in Uint8Array for Next.js response compatibility
    const binaryString = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
    const buf = new ArrayBuffer(binaryString.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < binaryString.length; i++) {
      view[i] = binaryString.charCodeAt(i) & 0xff;
    }

    const today = new Date().toISOString().split("T")[0];

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="narmada_crafts_backup_${today}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate Excel report" },
      { status: 500 }
    );
  }
}