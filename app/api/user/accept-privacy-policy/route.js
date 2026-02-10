import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedUser = await prisma.users.update({
      where: { email: session.user.email },
      data: {
        privacyPolicyAcceptedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Privacy policy accepted",
      acceptedAt: updatedUser.privacyPolicyAcceptedAt,
    });
  } catch (error) {
    console.error("Accept Privacy Policy Error:", error);
    return NextResponse.json(
      { error: "Failed to accept privacy policy" },
      { status: 500 },
    );
  }
}
