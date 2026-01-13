import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { transporter } from "@/lib/mailer";

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
    const { action, reason } = await req.json();

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
    const updateData = { status };
    if (action === "reject") {
       updateData.rejectionReason = reason;
    }

    const request = await prisma.providerRequest.update({
      where: { id: Number(id) },
      data: updateData,
      include: { user: true } // Fetch user for email
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

    // 3️⃣ Send Email
    if (request.user.email) {
       const dashboardLink = `${process.env.NEXTAUTH_URL}/providerDashboard`; 

       if (action === "reject") {
           await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: request.user.email,
            subject: "Provider Request Update",
            html: `
              <p>Dear ${request.user.name || "User"},</p>
              <p>Your request to become a provider has been <strong>rejected</strong>.</p>
              <p><strong>Reason:</strong> ${reason || "Not specified"}</p>
              <p>You can view details and reapply by visiting your dashboard:</p>
              <a href="${dashboardLink}">Go to Dashboard</a>
            `,
          });
       } else if (action === "approve") {
           await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: request.user.email,
            subject: "Provider Request Approved!",
            html: `
              <p>Dear ${request.user.name || "User"},</p>
              <p>Congratulations! Your request to become a provider has been <strong>APPROVED</strong>.</p>
              <p>You can now access your provider dashboard to post services.</p>
              <a href="${dashboardLink}">Go to Dashboard</a>
            `,
          });
       }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update request" },
      { status: 500 }
    );
  }
}
