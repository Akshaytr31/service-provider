import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/* ================= GET ALL REQUESTS ================= */
export async function GET() {
  try {
    const requests = await prisma.providerRequest.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true, // ✅ ONLY existing column
          },
        },
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("GET PROVIDER REQUESTS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch provider requests" },
      { status: 500 }
    );
  }
}
