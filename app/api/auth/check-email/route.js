import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    const [users] = await db.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length > 0) {
      return NextResponse.json({ exists: true });
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error("Check email error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
