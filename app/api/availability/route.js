import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const time = searchParams.get("time");

  if (!date || !time) {
    return NextResponse.json({ serviceIds: [] });
  }

  try {
    const query = `
      SELECT service_id as serviceId FROM bookings 
      WHERE DATE(date) = ? AND time = ? AND status = 'CONFIRMED'
    `;

    const [rows] = await db.query(query, [date, time]);
    const serviceIds = rows.map((row) => row.serviceId);

    return NextResponse.json({ serviceIds });
  } catch (error) {
    console.error("Availability Fetch Error:", error);
    return NextResponse.json({ serviceIds: [] }, { status: 500 });
  }
}
