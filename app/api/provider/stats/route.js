import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parallelize queries for better performance
    const [ratingAgg, totalReviews, activeJobsCount] = await Promise.all([
      prisma.review.aggregate({
        where: {
          booking: {
            provider: {
              id: user.id,
            },
          },
        },
        _avg: {
          rating: true,
        },
      }),
      prisma.review.count({
        where: {
          booking: {
            provider: {
              id: user.id,
            },
          },
        },
      }),
      prisma.booking.count({
        where: {
          providerId: user.id,
          status: {
            in: ["PENDING", "CONFIRMED", "IN_PROGRESS"], // Adjust based on your status enum
          },
        },
      }),
    ]);

    const avgRating = ratingAgg._avg.rating || 0;

    return NextResponse.json({
      rating: parseFloat(avgRating.toFixed(1)), // 1 decimal place
      totalReviews: totalReviews,
      activeJobs: activeJobsCount,
      // Revenue and views could be added here later
    });
  } catch (error) {
    console.error("Error fetching provider stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
