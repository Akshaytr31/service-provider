import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * GET → fetch provider jobs
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "provider") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [rows] = await db.query(
    "SELECT * FROM jobs WHERE providerEmail = ?",
    [session.user.email]
  );

  return NextResponse.json(rows);
}

/**
 * POST → create job
 */
export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "provider") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, description, location, salary } = await req.json();

  await db.query(
    "INSERT INTO jobs (providerEmail, title, description, location, salary) VALUES (?, ?, ?, ?, ?)",
    [session.user.email, title, description, location, salary]
  );

  return NextResponse.json({ success: true });
}
