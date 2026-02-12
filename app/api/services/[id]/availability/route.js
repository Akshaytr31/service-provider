import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, props) {
  const params = await props.params;
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");
  const { id } = params;

  if (!dateStr)
    return NextResponse.json({ error: "Date required" }, { status: 400 });

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        serviceId: parseInt(id),
        date: new Date(dateStr),
        status: "CONFIRMED",
      },
      select: { time: true },
    });

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
