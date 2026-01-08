import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, image } = await req.json();

    if (!name) {
      return NextResponse.json(
        { message: "Category name required" },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      "INSERT INTO categories (name, image) VALUES (?, ?)",
      [name, image || null]
    );

    return NextResponse.json({
      id: result.insertId,
      message: "Category created",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
