import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ needsAcceptance: false });
    }

    const [[userRows], [policyRows]] = await Promise.all([
      db.query("SELECT privacy_policy_accepted_at FROM users WHERE email = ?", [
        session.user.email,
      ]),
      db.query("SELECT * FROM privacy_policy ORDER BY updatedAt DESC LIMIT 1"),
    ]);

    const user = userRows[0];
    const policy = policyRows[0];

    if (!user || !policy) {
      return NextResponse.json({ needsAcceptance: false });
    }

    const policyUpdatedAt = new Date(policy.updatedAt);
    const userAcceptedAt = user.privacy_policy_accepted_at
      ? new Date(user.privacy_policy_accepted_at)
      : null;

    console.log("Check Policy Debug:", {
      email: session.user.email,
      policyUpdatedAt,
      userAcceptedAt,
      needsAcceptance: !userAcceptedAt || userAcceptedAt < policyUpdatedAt,
    });

    const needsAcceptance = !userAcceptedAt || userAcceptedAt < policyUpdatedAt;

    return NextResponse.json({
      needsAcceptance,
      content: policy.content,
    });
  } catch (error) {
    console.error("Check Privacy Policy Error:", error);
    return NextResponse.json(
      { error: "Failed to check privacy policy" },
      { status: 500 },
    );
  }
}
