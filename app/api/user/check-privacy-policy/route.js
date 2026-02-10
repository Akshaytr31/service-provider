import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ needsAcceptance: false });
    }

    const [user, policy] = await Promise.all([
      prisma.users.findUnique({
        where: { email: session.user.email },
        select: { privacyPolicyAcceptedAt: true },
      }),
      prisma.privacyPolicy.findFirst({
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    if (!user || !policy) {
      return NextResponse.json({ needsAcceptance: false });
    }

    const policyUpdatedAt = new Date(policy.updatedAt);
    const userAcceptedAt = user.privacyPolicyAcceptedAt
      ? new Date(user.privacyPolicyAcceptedAt)
      : null;

    console.log("Check Policy Debug:", {
      email: session.user.email,
      policyUpdatedAt,
      userAcceptedAt,
      needsAcceptance: !userAcceptedAt || userAcceptedAt < policyUpdatedAt,
    });

    // Check if user has accepted the latest policy
    // We allow a small buffer or just strict comparison.
    // If userAcceptedAt is null, or before policyUpdatedAt, then needs acceptance.
    const needsAcceptance = !userAcceptedAt || userAcceptedAt < policyUpdatedAt;

    return NextResponse.json({
      needsAcceptance,
      content: policy.content, // Send content to display in modal
    });
  } catch (error) {
    console.error("Check Privacy Policy Error:", error);
    return NextResponse.json(
      { error: "Failed to check privacy policy" },
      { status: 500 },
    );
  }
}
