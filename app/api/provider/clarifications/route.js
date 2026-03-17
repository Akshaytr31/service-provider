import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find provider request for this user
    const [requestRows] = await db.query(
      "SELECT id FROM provider_requests WHERE user_id = ? LIMIT 1",
      [session.user.id],
    );

    if (!requestRows[0]) {
      return NextResponse.json(
        { error: "No provider request found" },
        { status: 404 },
      );
    }

    const [messages] = await db.query(
      "SELECT * FROM clarifications WHERE provider_request_id = ? ORDER BY created_at ASC",
      [requestRows[0].id],
    );

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { message } = await req.json();

    const [requestRows] = await db.query(
      "SELECT id FROM provider_requests WHERE user_id = ? LIMIT 1",
      [session.user.id],
    );

    if (!requestRows[0]) {
      return NextResponse.json(
        { error: "No provider request found" },
        { status: 404 },
      );
    }

    const [result] = await db.query(
      "INSERT INTO clarifications (provider_request_id, message, sender, created_at) VALUES (?, ?, 'PROVIDER', NOW())",
      [requestRows[0].id, message],
    );

    const [newRows] = await db.query(
      "SELECT * FROM clarifications WHERE id = ?",
      [result.insertId],
    );

    return NextResponse.json(newRows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
