import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/* ================= GET PRIVACY POLICY ================= */
export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM privacy_policy WHERE id = 1");

    return NextResponse.json(rows[0] || {});
  } catch (error) {
    console.error("GET Privacy Policy Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch privacy policy", details: error.message },
      { status: 500 },
    );
  }
}

/* ================= CREATE / UPDATE PRIVACY POLICY ================= */
export async function POST(req) {
  try {
    const { content } = await req.json();

    await db.query(
      `INSERT INTO privacy_policy (id, content, updatedAt) VALUES (1, ?, NOW())
       ON DUPLICATE KEY UPDATE content = VALUES(content), updatedAt = NOW()`,
      [content],
    );

    const [rows] = await db.query("SELECT * FROM privacy_policy WHERE id = 1");

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("POST Privacy Policy Error:", error);
    return NextResponse.json(
      { error: "Failed to save privacy policy", details: error.message },
      { status: 500 },
    );
  }
}
