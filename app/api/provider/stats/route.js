import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [userRows] = await db.query("SELECT id FROM users WHERE email = ?", [
      session.user.email,
    ]);
    const user = userRows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parallelize queries for better performance
    const [[ratingRows], [countRows], [activeJobsRows]] = await Promise.all([
      db.query(
        `SELECT AVG(r.rating) AS avgRating
         FROM reviews r
         JOIN bookings b ON r.booking_id = b.id
         WHERE b.provider_id = ?`,
        [user.id],
      ),
      db.query(
        `SELECT COUNT(*) AS totalReviews
         FROM reviews r
         JOIN bookings b ON r.booking_id = b.id
         WHERE b.provider_id = ?`,
        [user.id],
      ),
      db.query(
        `SELECT COUNT(*) AS activeJobs
         FROM bookings
         WHERE provider_id = ? AND status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS')`,
        [user.id],
      ),
    ]);

    const avgRating = ratingRows[0].avgRating || 0;

    return NextResponse.json({
      rating: parseFloat(Number(avgRating).toFixed(1)),
      totalReviews: countRows[0].totalReviews,
      activeJobs: activeJobsRows[0].activeJobs,
    });
  } catch (error) {
    console.error("Error fetching provider stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
