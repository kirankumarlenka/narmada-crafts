import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 1. Fetch Idol Orders
    const idols = await prisma.deityIdol.findMany({
      include: { images: true },
      orderBy: { createdAt: "desc" },
    });

    // 2. Fetch Customer Bookings
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
    });

    // 3. Format Idol Orders Data
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

    // 4. Format Bookings Data
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

    // 5. Build Multi-Sheet Excel Workbook
    const workbook = XLSX.utils.book_new();

    const idolWorksheet = XLSX.utils.json_to_sheet(idolsSheetData);
    XLSX.utils.book_append_sheet(workbook, idolWorksheet, "Deity Orders");

    const bookingWorksheet = XLSX.utils.json_to_sheet(bookingsSheetData);
    XLSX.utils.book_append_sheet(workbook, bookingWorksheet, "Customer Inquiries");

    // 6. Generate Binary Buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="narmada_crafts_data_${new Date().toISOString().split("T")[0]}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to export data" },
      { status: 500 }
    );
  }
}