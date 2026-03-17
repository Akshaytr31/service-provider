import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { transporter } from "@/lib/mailer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [requestRows] = await db.query(
      `SELECT pr.*, u.id AS userId, u.email AS userEmail, u.name AS userName
       FROM provider_requests pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.status = 'APPROVED'`,
    );

    let blockedCount = 0;
    let unblockedCount = 0;
    let reminderCount = 0;

    for (const req of requestRows) {
      if (!req.userEmail) continue;

      // Parse licenses JSON
      let licenses = req.licenses;
      if (typeof licenses === "string") {
        try {
          licenses = JSON.parse(licenses);
        } catch {
          continue;
        }
      }
      if (!Array.isArray(licenses)) continue;

      let licensesUpdated = false;
      const today = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);

      const validSubCategoryIds = new Set();
      const linkedSubCategoryIds = new Set();

      for (const lic of licenses) {
        if (!lic.subCategoryId) continue;

        const subId = String(lic.subCategoryId);
        linkedSubCategoryIds.add(subId);

        const expiryDate = new Date(lic.expiry);
        if (expiryDate > today) {
          validSubCategoryIds.add(subId);

          if (expiryDate <= sevenDaysFromNow && !lic.reminderSent) {
            try {
              await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: req.userEmail,
                subject: `Action Required: License Expiring Soon (${lic.name || "Document"})`,
                html: `
                    <p>Dear ${req.userName || "User"},</p>
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

      // Update provider request if licenses were modified
      if (licensesUpdated) {
        await db.query(
          "UPDATE provider_requests SET licenses = ? WHERE id = ?",
          [JSON.stringify(licenses), req.id],
        );
      }

      // Fetch provider's services
      const [services] = await db.query(
        "SELECT * FROM services WHERE providerEmail = ?",
        [req.userEmail],
      );

      for (const service of services) {
        const subId = String(service.sub_category_id);

        if (linkedSubCategoryIds.has(subId)) {
          if (!validSubCategoryIds.has(subId)) {
            if (service.status !== "BLOCKED") {
              await db.query(
                "UPDATE services SET status = 'BLOCKED' WHERE id = ?",
                [service.id],
              );
              blockedCount++;
            }
          } else {
            if (service.status === "BLOCKED") {
              await db.query(
                "UPDATE services SET status = 'ACTIVE' WHERE id = ?",
                [service.id],
              );
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
