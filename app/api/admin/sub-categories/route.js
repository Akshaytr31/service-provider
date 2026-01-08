import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, categoryId } = await req.json();

    if (!name || !categoryId) {
      return NextResponse.json(
        { message: "Name and category required" },
        { status: 400 }
      );
    }

    await db.query(
      "INSERT INTO sub_categories (name, category_id) VALUES (?, ?)",
      [name, categoryId]
    );

    return NextResponse.json({
      message: "Sub-category created",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
