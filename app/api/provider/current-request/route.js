import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const providerRequest = await prisma.providerRequest.findFirst({
      where: { userId: Number(session.user.id) },
      orderBy: { createdAt: "desc" }, // Get the latest one if multiple
    });

    if (!providerRequest) {
      return NextResponse.json({ error: "No request found" }, { status: 404 });
    }

    return NextResponse.json(providerRequest);
  } catch (error) {
    console.error("GET Current Request Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
