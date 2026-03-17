import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET all users
export async function GET() {
  try {
    const [users] = await db.query("SELECT * FROM users");
    return NextResponse.json(users);
  } catch (error) {
    console.error("GET Users Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

// CREATE user
export async function POST(req) {
  try {
    const { name, email } = await req.json();

    const [result] = await db.query(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      [name, email],
    );

    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [
      result.insertId,
    ]);

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("POST User Error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
