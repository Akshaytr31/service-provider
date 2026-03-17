import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.query(
      "UPDATE users SET privacy_policy_accepted_at = NOW() WHERE email = ?",
      [session.user.email],
    );

    return NextResponse.json({
      message: "Privacy policy accepted",
      acceptedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Accept Privacy Policy Error:", error);
    return NextResponse.json(
      { error: "Failed to accept privacy policy" },
      { status: 500 },
    );
  }
}
