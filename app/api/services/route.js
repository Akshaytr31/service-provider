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
      { status: 400 }
    );
  }

  const [providerRows] = await db.query(
    `SELECT service_radius, services_offered
     FROM provider_requests
     WHERE user_id = ? AND status = 'APPROVED'`,
    [session.user.id]
  );

  if (!providerRows.length) {
    return NextResponse.json(
      { error: "Provider request not approved" },
      { status: 403 }
    );
  }

  let servicesOfferedForThisService = null;
  const allServicesOffered = providerRows[0].services_offered;

  if (allServicesOffered) {
    const parsed =
      typeof allServicesOffered === "string"
        ? JSON.parse(allServicesOffered)
        : allServicesOffered;

    const match = parsed.find(
      (item) => Number(item.subCategoryId) === Number(subCategoryId)
    );

    servicesOfferedForThisService = match?.services || null;
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
      servicesOfferedForThisService
        ? JSON.stringify(servicesOfferedForThisService)
        : null,
    ]
  );

  return NextResponse.json({ success: true });
}
