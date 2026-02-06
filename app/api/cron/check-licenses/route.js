import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { transporter } from "@/lib/mailer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const requests = await prisma.providerRequest.findMany({
      where: { status: "APPROVED" },
      include: { user: true },
    });

    let blockedCount = 0;
    let unblockedCount = 0;
    let reminderCount = 0;

    for (const req of requests) {
      if (!req.user?.email) continue;

      const licenses = req.licenses;
      if (!Array.isArray(licenses)) continue;

      let licensesUpdated = false;
      const today = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);

      // Track which subcategories have at least one VALID license
      const validSubCategoryIds = new Set();
      // Track which subcategories are LINKED to any license (valid or expired)
      const linkedSubCategoryIds = new Set();

      for (const lic of licenses) {
        if (!lic.subCategoryId) continue;

        const subId = String(lic.subCategoryId);
        linkedSubCategoryIds.add(subId);

        const expiryDate = new Date(lic.expiry);
        // Check if fresh
        if (expiryDate > today) {
          validSubCategoryIds.add(subId);

          // Check if expiring soon (within 7 days) AND reminder not sent
          // We check if it is within the next 7 days window: today < expiry <= sevenDaysFromNow
          if (expiryDate <= sevenDaysFromNow && !lic.reminderSent) {
            try {
              await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: req.user.email,
                subject: `Action Required: License Expiring Soon (${lic.name || "Document"})`,
                html: `
                    <p>Dear ${req.user.name || "User"},</p>
                    <p>Your license <strong>${lic.name} (Version ${lic.version || 1})</strong> is expiring on <strong>${expiryDate.toDateString()}</strong>.</p>
                    <p>Please log in to your profile and upload the latest version to avoid service disruption.</p>
                `,
              });
              lic.reminderSent = true;
              licensesUpdated = true;
              reminderCount++;
            } catch (e) {
              console.error("Failed to send reminder email", e);
            }
          }
        }
      }

      // Update provider request if licenses were modified (reminderSent flag added)
      if (licensesUpdated) {
        await prisma.providerRequest.update({
          where: { id: req.id },
          data: { licenses },
        });
      }

      // Fetch provider's services
      const services = await prisma.services.findMany({
        where: { providerEmail: req.user.email },
      });

      for (const service of services) {
        const subId = String(service.subCategoryId);

        // Logic:
        // 1. If service is linked to a license category (linkedSubCategoryIds.has(subId))
        // 2. AND there is NO valid license for it (!validSubCategoryIds.has(subId))
        // -> BLOCK IT

        // 3. If there IS a valid license -> UNBLOCK IT (if it was blocked)

        if (linkedSubCategoryIds.has(subId)) {
          if (!validSubCategoryIds.has(subId)) {
            // Expired / Missing Valid License
            if (service.status !== "BLOCKED") {
              await prisma.services.update({
                where: { id: service.id },
                data: { status: "BLOCKED" },
              });
              blockedCount++;
            }
          } else {
            // Has Valid License
            if (service.status === "BLOCKED") {
              await prisma.services.update({
                where: { id: service.id },
                data: { status: "ACTIVE" },
              });
              unblockedCount++;
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `License check complete. Blocked: ${blockedCount}, Unblocked: ${unblockedCount}, Reminders Sent: ${reminderCount}`,
    });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json(
      { error: `Failed to run license check: ${error.message}` },
      { status: 500 },
    );
  }
}
