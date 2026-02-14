import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, props) {
  const params = await props.params;
  try {
    const { id } = params;

    const [rows] = await db.query(
      `SELECT s.*, u.id as providerUserId 
       FROM services s 
       LEFT JOIN users u ON s.providerEmail = u.email 
       WHERE s.id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Fetch reviews
    const [reviews] = await db.query(
      `SELECT r.rating, r.comment, r.created_at, u.name as seekerName, u.image as seekerImage
       FROM reviews r
       JOIN bookings b ON r.booking_id = b.id
       JOIN users u ON b.seeker_id = u.id
       WHERE b.service_id = ?
       ORDER BY r.created_at DESC`,
      [id],
    );

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating =
      reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    return NextResponse.json({
      ...rows[0],
      reviews,
      averageRating: parseFloat(averageRating),
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
