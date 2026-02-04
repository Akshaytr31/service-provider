import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";

// Force dynamic since we check dates
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const today = new Date();
    // Add 7 days to today
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    // Format to match the "yyyy-mm-dd" format likely stored in JSON
    // The input type="date" typically saves as YYYY-MM-DD string.
    // e.g., 2026-02-11
    const targetDateStr = sevenDaysFromNow.toISOString().split("T")[0];

    console.log(`Checking for licenses expiring on: ${targetDateStr}`);

    // Fetch all approved providers
    const providers = await prisma.providerRequest.findMany({
      where: {
        status: "APPROVED",
        licenses: {
          not: null, // Ensure licenses field is not null
        },
      },
      include: {
        user: true, // Need user email and name
      },
      // Note: We can't easily filter JSON array contents in SQL/Prisma level seamlessly across all DBs for specific structure match without raw query.
      // So detailed filtering will happen in application logic.
    });

    let emailsSent = 0;
    const sentList = [];

    for (const provider of providers) {
      const { licenses } = provider;
      if (!Array.isArray(licenses)) continue;

      const expiringLicenses = licenses.filter((license) => {
        // license.expiry is expected to be "YYYY-MM-DD"
        return license.expiry === targetDateStr;
      });

      if (expiringLicenses.length > 0) {
        const licenseNames = expiringLicenses
          .map((l) => l.name || "Unknown License")
          .join(", ");

        const emailSubject = "Action Required: License Expiration Warning";
        const emailBody = `
Dear ${provider.firstName || "Provider"},

This is a reminder that the following license(s) associated with your profile are set to expire in 7 days (on ${targetDateStr}):

${licenseNames}

Please update your license information in your dashboard to ensure continued service on our platform.

Best regards,
The Team
        `;

        if (provider.user?.email) {
          await sendEmail(provider.user.email, emailSubject, emailBody);
          emailsSent++;
          sentList.push({
            providerId: provider.id,
            email: provider.user.email,
            licenses: licenseNames,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Check complete. Sent ${emailsSent} reminder emails.`,
      targetDate: targetDateStr,
      details: sentList,
    });
  } catch (error) {
    console.error("Cron check failed:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
