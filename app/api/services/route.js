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

  const body = await req.json();
  const { title, description, location, price, subCategoryId, coverPhoto } =
    body;

  if (!title || !description || !subCategoryId) {
    return NextResponse.json(
      { error: "Title, description, and subcategory are required" },
      { status: 400 },
    );
  }

  await db.query(
    `INSERT INTO services (providerEmail, title, description, location, price, sub_category_id, coverPhoto)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      session.user.email,
      title,
      description,
      location,
      price,
      subCategoryId,
      coverPhoto,
    ],
  );

  return NextResponse.json({ success: true });
}
