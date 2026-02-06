import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, props) {
  const params = await props.params;
  try {
    const { id } = params;

    const [rows] = await db.query(
      `SELECT s.*, u.id as providerUserId 
       FROM services s 
       LEFT JOIN users u ON s.providerEmail = u.email 
       WHERE s.id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
