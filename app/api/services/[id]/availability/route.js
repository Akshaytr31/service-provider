import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req, props) {
  const params = await props.params;
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");
  const { id } = params;

  if (!dateStr)
    return NextResponse.json({ error: "Date required" }, { status: 400 });

  try {
    const [bookings] = await db.query(
      "SELECT time FROM bookings WHERE service_id = ? AND date = ? AND status IN ('PENDING', 'CONFIRMED')",
      [parseInt(id), new Date(dateStr)],
    );

    const bookedSlots = bookings.map((b) => b.time);
    return NextResponse.json(bookedSlots);
  } catch (error) {
    console.error("Availability Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
