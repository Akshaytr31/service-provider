import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * GET → Seeker sees all services
 */
export async function GET(req) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const mine = searchParams.get("mine");
  const date = searchParams.get("date");
  const time = searchParams.get("time");

  let query = `
    SELECT 
      s.*, 
      params_sub.name AS subCategoryName,
      params_cat.name AS categoryName,
      COUNT(r.id) AS reviewCount,
      COALESCE(AVG(r.rating), 0) AS rating
    FROM services s
    LEFT JOIN sub_categories params_sub ON s.sub_category_id = params_sub.id
    LEFT JOIN categories params_cat ON params_sub.category_id = params_cat.id
    LEFT JOIN bookings b ON s.id = b.service_id
    LEFT JOIN reviews r ON b.id = r.booking_id
    WHERE s.status = 'ACTIVE'
  `;

  let params = [];
  let groupBy = " GROUP BY s.id";

  if (mine === "true") {
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    query = `
      SELECT s.*, 
        COUNT(r.id) AS reviewCount,
        COALESCE(AVG(r.rating), 0) AS rating
      FROM services s
      LEFT JOIN bookings b ON s.id = b.service_id
      LEFT JOIN reviews r ON b.id = r.booking_id
      WHERE s.providerEmail = ? 
    `;
    params = [session.user.email];
    groupBy = " GROUP BY s.id ORDER BY s.createdAt DESC";
  }

  const [services] = await db.query(query + groupBy, params);

  return NextResponse.json(services);
}

/**
 * POST → Provider creates a service
 */
export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "provider") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, location, price, subCategoryId, coverPhoto } =
    await req.json();

  if (!title || !description || !subCategoryId) {
    return NextResponse.json(
      { error: "Title, description, and subcategory are required" },
      { status: 400 },
    );
  }

  const [providerRows] = await db.query(
    `SELECT service_radius, services_offered, licenses
     FROM provider_requests
     WHERE user_id = ? AND status = 'APPROVED'`,
    [session.user.id],
  );

  if (!providerRows.length) {
    return NextResponse.json(
      { error: "Provider not approved" },
      { status: 403 },
    );
  }

  // Check for valid license for this subcategory
  const licenses = providerRows[0].licenses; // JSON column
  let validLicense = false;

  if (licenses && Array.isArray(licenses)) {
    const today = new Date();
    validLicense = licenses.some((lic) => {
      // Check if linked to this subcategory
      const isLinked = String(lic.subCategoryId) === String(subCategoryId);
      // Check expiry
      const expiryDate = new Date(lic.expiry);
      const isActive = expiryDate > today;

      return isLinked && isActive;
    });
  }

  // Also check if the service relies on a license.
  // If the user hasn't linked ANY license to this subcategory, we might block it.
  // Requirement: "connection between each licence and corresponding services... any licence is expire that corresponding sevice posted... should be blocked"
  // This implies strict requirement: Must have a valid license for the service.

  if (!validLicense) {
    return NextResponse.json(
      {
        error:
          "You do not have a valid (non-expired) license linked to this service category.",
      },
      { status: 403 },
    );
  }

  let extraSkillsForService = null;
  const rawServicesOffered = providerRows[0].services_offered;

  if (rawServicesOffered) {
    const parsed =
      typeof rawServicesOffered === "string"
        ? JSON.parse(rawServicesOffered)
        : rawServicesOffered;

    const matchedService = parsed.find(
      (item) => String(item.subCategoryId) === String(subCategoryId),
    );

    extraSkillsForService = matchedService?.extraSkills || null;
  }

  await db.query(
    `INSERT INTO services
     (providerEmail, title, description, location, price, sub_category_id, coverPhoto, service_radius, services_offered)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.user.email,
      title,
      description,
      location,
      price,
      subCategoryId,
      coverPhoto,
      providerRows[0].service_radius,
      extraSkillsForService ? JSON.stringify(extraSkillsForService) : null,
    ],
  );

  return NextResponse.json({ success: true });
}
