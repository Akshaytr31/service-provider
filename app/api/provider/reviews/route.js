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

    const [reviews] = await db.query(
      `SELECT 
        r.id, r.rating, r.comment, r.created_at AS createdAt, r.booking_id,
        b.seeker_id, b.service_id,
        seeker.name AS seekerName, seeker.image AS seekerImage,
        sp.firstName AS seekerFirstName, sp.lastName AS seekerLastName,
        s.title AS serviceTitle
       FROM reviews r
       JOIN bookings b ON r.booking_id = b.id
       LEFT JOIN users seeker ON b.seeker_id = seeker.id
       LEFT JOIN SeekerProfile sp ON sp.userId = seeker.id
       LEFT JOIN services s ON b.service_id = s.id
       WHERE b.provider_id = ?
       ORDER BY r.created_at DESC`,
      [user.id],
    );

    // Reshape to match Prisma's nested include format
    const result = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      bookingId: r.booking_id,
      booking: {
        seeker: {
          name: r.seekerName,
          image: r.seekerImage,
          seekerProfile: {
            firstName: r.seekerFirstName,
            lastName: r.seekerLastName,
          },
        },
        service: {
          title: r.serviceTitle,
        },
      },
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching provider reviews:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
