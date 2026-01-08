import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * GET → Seeker sees all services
 */
export async function GET() {
  const [services] = await db.query(
    "SELECT * FROM services ORDER BY createdAt DESC"
  );

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
  const { title, description, location, price, subCategoryId } = body;

  if (!title || !description || !subCategoryId) {
    return NextResponse.json(
      { error: "Title, description, and subcategory are required" },
      { status: 400 }
    );
  }

  await db.query(
    `INSERT INTO services (providerEmail, title, description, location, price, sub_category_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      session.user.email,
      title,
      description,
      location,
      price,
      subCategoryId,
    ]
  );

  return NextResponse.json({ success: true });
}
