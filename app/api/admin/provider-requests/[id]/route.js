import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/* ================= GET SINGLE REQUEST ================= */
export async function GET(req, context) {
  try {
    const { id } = await context.params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Invalid request id" },
        { status: 400 }
      );
    }

    const request = await prisma.providerRequest.findUnique({
      where: { id: Number(id) },
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

    if (!request) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error("GET REQUEST ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch request" },
      { status: 500 }
    );
  }
}

/* ================= APPROVE / REJECT ================= */
export async function PATCH(req, context) {
  try {
    const { id } = await context.params;
    const { action } = await req.json();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Invalid request id" },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const status = action === "approve" ? "APPROVED" : "REJECTED";

    // 1️⃣ Update provider request status
    const request = await prisma.providerRequest.update({
      where: { id: Number(id) },
      data: { status },
    });

    // 2️⃣ Update user role safely (NO firstName access)
    await prisma.users.updateMany({
      where: { id: request.userId },
      data:
        action === "approve"
          ? {
              role: "provider",
              providerRequestStatus: "approved",
            }
          : {
              providerRequestStatus: "rejected",
            },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}
