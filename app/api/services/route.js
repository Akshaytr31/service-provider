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

  let query = "SELECT * FROM services ORDER BY createdAt DESC";
  let params = [];

  if (mine === "true") {
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    query =
      "SELECT * FROM services WHERE providerEmail = ? ORDER BY createdAt DESC";
    params = [session.user.email];
  }

  const [services] = await db.query(query, params);

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
    `SELECT service_radius, services_offered
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
