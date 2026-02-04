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
        { status: 400 },
      );
    }

    const request = await prisma.providerRequest.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        clarifications: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // AUTO-EXPIRE CHECK
    let hasUpdates = false;
    const now = new Date();
    // Normalize "now" to midnight to compare dates properly if expiry is just YYYY-MM-DD string
    // But assuming simple date comparison works for now.
    // Ideally we treat expiry date string as T00:00:00 or T23:59:59 depending on logic.
    // let's stick to simple Date comparison.

    if (Array.isArray(request.licenses)) {
      for (const license of request.licenses) {
        if (
          license.expiry &&
          new Date(license.expiry) < now &&
          license.status !== "EXPIRED"
        ) {
          license.status = "EXPIRED";
          hasUpdates = true;

          // Send Email
          if (request.user?.email) {
            const dashboardLink = `${process.env.NEXTAUTH_URL}/profile`;
            // Using a simple async fire-and-forget or await?
            // Better to await to ensure it sends, or catch error so it doesn't block response.
            // We'll await inside the loop for safety.
            try {
              await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: request.user.email,
                subject: `Action Required: License Expired (${license.name || "Document"})`,
                html: `
                    <p>Dear ${request.user.name || "User"},</p>
                    <p>Your license <strong>${license.name} (Version ${license.version || 1})</strong> has expired.</p>
                    <p>Please log in to your profile and upload the latest version immediately.</p>
                    <a href="${dashboardLink}">Update License Now</a>
                `,
              });
            } catch (e) {
              console.error("Failed to send expiry email", e);
            }
          }
        }
      }

      if (hasUpdates) {
        await prisma.providerRequest.update({
          where: { id: Number(id) },
          data: { licenses: request.licenses },
        });
      }
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error("GET REQUEST ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch request" },
      { status: 500 },
    );
  }
}

/* ================= APPROVE / REJECT ================= */
export async function PATCH(req, context) {
  try {
    const { id } = await context.params;
    const { action, reason, licenseIndex } = await req.json();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Invalid request id" },
        { status: 400 },
      );
    }

    if (
      ![
        "approve",
        "reject",
        "clarify",
        "expire_license",
        "approve_license",
        "reject_license",
      ].includes(action)
    ) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // HANDLE LICENSE EXPIRATION
    if (action === "expire_license") {
      const request = await prisma.providerRequest.findUnique({
        where: { id: Number(id) },
        include: { user: true },
      });

      if (!request) {
        return NextResponse.json(
          { error: "Request not found" },
          { status: 404 },
        );
      }

      // Update License Status in JSON
      const licenses = Array.isArray(request.licenses) ? request.licenses : [];
      if (typeof licenseIndex !== "number" || !licenses[licenseIndex]) {
        return NextResponse.json(
          { error: "Invalid license index" },
          { status: 400 },
        );
      }

      const licenseName = licenses[licenseIndex].name || "License";
      const licenseVersion = licenses[licenseIndex].version || 1;

      licenses[licenseIndex].status = "EXPIRED";

      // Update DB
      await prisma.providerRequest.update({
        where: { id: Number(id) },
        data: { licenses },
      });

      // Send Email
      if (request.user?.email) {
        const dashboardLink = `${process.env.NEXTAUTH_URL}/profile`;
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: request.user.email,
          subject: `Action Required: License Expired (${licenseName})`,
          html: `
            <p>Dear ${request.user.name || "User"},</p>
            <p>Your license <strong>${licenseName} (Version ${licenseVersion})</strong> has been marked as <strong>EXPIRED</strong> by the admin.</p>
            <p>Please log in to your profile and upload the latest version of this document immediately to avoid service disruption.</p>
            <a href="${dashboardLink}">Update License Now</a>
          `,
        });
      }

      // Trigger async check
      await updateServiceStatusForProvider(request.user?.email);

      return NextResponse.json({
        success: true,
        message: "License marked as expired",
      });
    }

    // HANDLE LICENSE APPROVAL
    if (action === "approve_license") {
      const request = await prisma.providerRequest.findUnique({
        where: { id: Number(id) },
        include: { user: true },
      });

      if (!request) {
        return NextResponse.json(
          { error: "Request not found" },
          { status: 404 },
        );
      }

      // Update License Status in JSON
      const licenses = Array.isArray(request.licenses) ? request.licenses : [];
      if (typeof licenseIndex !== "number" || !licenses[licenseIndex]) {
        return NextResponse.json(
          { error: "Invalid license index" },
          { status: 400 },
        );
      }

      const licenseName = licenses[licenseIndex].name || "License";
      const licenseVersion = licenses[licenseIndex].version || 1;

      licenses[licenseIndex].status = "APPROVED";

      // Update DB
      await prisma.providerRequest.update({
        where: { id: Number(id) },
        data: { licenses },
      });

      // Send Email
      if (request.user?.email) {
        const dashboardLink = `${process.env.NEXTAUTH_URL}/profile`;
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: request.user.email,
            subject: `License Approved: ${licenseName}`,
            html: `
                <p>Dear ${request.user.name || "User"},</p>
                <p>Your license <strong>${licenseName} (Version ${licenseVersion})</strong> has been <strong>APPROVED</strong> by the admin.</p>
                <p>Thank you for keeping your documentation up to date.</p>
                <a href="${dashboardLink}">View Profile</a>
            `,
          });
        } catch (e) {
          console.error("Failed to send approval email", e);
        }
      }

      await updateServiceStatusForProvider(request.user?.email);

      return NextResponse.json({
        success: true,
        message: "License approved",
      });
    }

    // HANDLE LICENSE REJECTION
    if (action === "reject_license") {
      const request = await prisma.providerRequest.findUnique({
        where: { id: Number(id) },
        include: { user: true },
      });

      if (!request) {
        return NextResponse.json(
          { error: "Request not found" },
          { status: 404 },
        );
      }

      // Update License Status in JSON
      const licenses = Array.isArray(request.licenses) ? request.licenses : [];
      if (typeof licenseIndex !== "number" || !licenses[licenseIndex]) {
        return NextResponse.json(
          { error: "Invalid license index" },
          { status: 400 },
        );
      }

      const licenseName = licenses[licenseIndex].name || "License";
      const licenseVersion = licenses[licenseIndex].version || 1;

      licenses[licenseIndex].status = "REJECTED";

      // Update DB
      await prisma.providerRequest.update({
        where: { id: Number(id) },
        data: { licenses },
      });

      // Send Email
      if (request.user?.email) {
        const dashboardLink = `${process.env.NEXTAUTH_URL}/profile`;
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: request.user.email,
            subject: `Action Required: License Rejected (${licenseName})`,
            html: `
                <p>Dear ${request.user.name || "User"},</p>
                <p>Your license <strong>${licenseName} (Version ${licenseVersion})</strong> has been <strong>REJECTED</strong> by the admin.</p>
                <p>Please log in to your profile to upload a valid document.</p>
                <a href="${dashboardLink}">Update License Now</a>
            `,
          });
        } catch (e) {
          console.error("Failed to send rejection email", e);
        }
      }

      return NextResponse.json({
        success: true,
        message: "License rejected",
      });
    }

    // HANDLE CLARIFICATION (No status change)
    if (action === "clarify") {
      const request = await prisma.providerRequest.findUnique({
        where: { id: Number(id) },
        include: { user: true },
      });

      if (!request) {
        return NextResponse.json(
          { error: "Request not found" },
          { status: 404 },
        );
      }

      if (request.user?.email) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: request.user.email,
          subject: "Clarification Needed for Provider Request",
          html: `
            <p>Dear ${request.user.name || "User"},</p>
            <p>We reviewed your provider request and need some clarification.</p>
            <p><strong>Message from Admin:</strong></p>
            <blockquote style="border-left: 4px solid #ccc; padding-left: 10px; color: #555;">
              ${reason}
            </blockquote>
            <p>Please check your details and update necessary information.</p>
          `,
        });
      }

      // SAVE CLARIFICATION TO DB
      await prisma.clarification.create({
        data: {
          providerRequestId: request.id,
          message: reason,
          sender: "ADMIN",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Clarification sent",
      });
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
      include: { user: true }, // Fetch user for email
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
            `,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update request" },
      { status: 500 },
    );
  }
}

// HELPER TO UPDATE STATUS INSTANTLY
async function updateServiceStatusForProvider(email) {
  if (!email) return;

  // 1. Get Provider Request
  const provider = await prisma.providerRequest.findFirst({
    where: { user: { email } },
  });

  if (!provider || !provider.licenses) return;

  const licenses = provider.licenses;
  const today = new Date();

  // Track VALID subcategories
  const validSubCategoryIds = new Set();
  const linkedSubCategoryIds = new Set();

  for (const lic of licenses) {
    if (!lic.subCategoryId) continue;
    const subId = String(lic.subCategoryId);
    linkedSubCategoryIds.add(subId);

    // Check Expiry AND Status (Must be APPROVED)
    // If Admin just approved it, status is APPROVED.
    const expiryDate = new Date(lic.expiry);
    if (expiryDate > today && lic.status === "APPROVED") {
      validSubCategoryIds.add(subId);
    }
  }

  // 2. Get Services
  const services = await prisma.services.findMany({
    where: { providerEmail: email },
  });

  for (const service of services) {
    const subId = String(service.subCategoryId);

    // If linked but NO valid license -> BLOCK
    if (linkedSubCategoryIds.has(subId)) {
      if (!validSubCategoryIds.has(subId)) {
        if (service.status !== "BLOCKED") {
          await prisma.services.update({
            where: { id: service.id },
            data: { status: "BLOCKED" },
          });
        }
      } else {
        // HAS valid license -> UNBLOCK
        if (service.status === "BLOCKED") {
          await prisma.services.update({
            where: { id: service.id },
            data: { status: "ACTIVE" },
          });
        }
      }
    }
  }
}
