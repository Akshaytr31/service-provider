import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch the latest privacy policy to get the last updated date
    const [policyRows] = await db.query(
      "SELECT * FROM privacy_policy ORDER BY updatedAt DESC LIMIT 1",
    );

    const policy = policyRows[0];

    if (!policy) {
      return NextResponse.json({
        providers: [],
        seekers: [],
        policyUpdatedAt: null,
      });
    }

    const policyUpdatedAt = new Date(policy.updatedAt);

    // Fetch all users with their roles and acceptance date
    const [users] = await db.query(
      "SELECT id, name, email, role, privacy_policy_accepted_at FROM users WHERE role IN ('provider', 'seeker')",
    );

    console.log("Admin Status API - Users Found:", users.length);
    console.log("Admin Status API - First User:", users[0]);

    // Categorize users and determine status
    const providers = [];
    const seekers = [];

    users.forEach((user) => {
      const acceptedAt = user.privacy_policy_accepted_at
        ? new Date(user.privacy_policy_accepted_at)
        : null;

      const isAccepted = acceptedAt && acceptedAt >= policyUpdatedAt;

      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        isAccepted,
        acceptedAt: user.privacy_policy_accepted_at,
      };

      if (user.role === "provider") {
        providers.push(userData);
      } else if (user.role === "seeker") {
        seekers.push(userData);
      }
    });

    return NextResponse.json({
      providers,
      seekers,
      policyUpdatedAt: policy.updatedAt,
    });
  } catch (error) {
    console.error("GET Privacy Policy Status Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch status", details: error.message },
      { status: 500 },
    );
  }
}
