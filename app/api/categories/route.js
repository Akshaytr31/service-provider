import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch all categories
    const [categories] = await db.query("SELECT * FROM categories");
    
    // Fetch all subcategories
    const [subCategories] = await db.query("SELECT * FROM sub_categories");

    // Combine them
    const categoriesWithSubs = categories.map(cat => ({
      ...cat,
      subCategories: subCategories.filter(sub => sub.category_id === cat.id)
    }));

    return NextResponse.json(categoriesWithSubs);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
