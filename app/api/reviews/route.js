import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { bookingId, rating, comment } = await req.json();

    if (!bookingId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get User
    const [userRows] = await db.query("SELECT id FROM users WHERE email = ?", [
      session.user.email,
    ]);
    const user = userRows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify Booking Ownership and Status
    const [bookingRows] = await db.query(
      `SELECT b.*, r.id AS reviewId
       FROM bookings b
       LEFT JOIN reviews r ON r.booking_id = b.id
       WHERE b.id = ?`,
      [parseInt(bookingId)],
    );
    const booking = bookingRows[0];

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.seeker_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to this booking" },
        { status: 403 },
      );
    }

    if (booking.reviewId) {
      return NextResponse.json(
        { error: "Review already exists for this booking" },
        { status: 409 },
      );
    }

    // Create Review
    const [result] = await db.query(
      `INSERT INTO reviews (rating, comment, booking_id, created_at)
       VALUES (?, ?, ?, NOW())`,
      [parseInt(rating), comment || null, parseInt(bookingId)],
    );

    const [reviewRows] = await db.query("SELECT * FROM reviews WHERE id = ?", [
      result.insertId,
    ]);

    return NextResponse.json(reviewRows[0]);
  } catch (error) {
    console.error("Review Create Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
