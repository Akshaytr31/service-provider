import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [rows] = await db.query(
      "SELECT * FROM provider_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [Number(session.user.id)],
    );

    if (!rows[0]) {
      return NextResponse.json({ error: "No request found" }, { status: 404 });
    }

    const request = rows[0];

    // Parse JSON columns
    const jsonCols = [
      "licenses",
      "qualifications",
      "availability",
      "payment_methods",
      "service_areas",
      "services_offered",
      "gallery",
    ];
    for (const col of jsonCols) {
      if (request[col] && typeof request[col] === "string") {
        try {
          request[col] = JSON.parse(request[col]);
        } catch {}
      }
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error("GET Current Request Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
