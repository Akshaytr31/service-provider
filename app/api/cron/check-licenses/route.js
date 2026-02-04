import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const requests = await prisma.providerRequest.findMany({
      where: { status: "APPROVED" },
      include: { user: true },
    });

    let blockedCount = 0;
    let unblockedCount = 0;

    for (const req of requests) {
      if (!req.user?.email) continue;

      const licenses = req.licenses;
      if (!Array.isArray(licenses)) continue;

      const today = new Date();

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
        }
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
      message: `License check complete. Blocked: ${blockedCount}, Unblocked: ${unblockedCount}`,
    });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json(
      { error: `Failed to run license check: ${error.message}` },
      { status: 500 },
    );
  }
}
