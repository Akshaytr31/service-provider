import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify Booking Ownership and Status
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: { review: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.seekerId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to this booking" },
        { status: 403 },
      );
    }

    // Optional: Check if booking is completed (or whatever status indicates completion)
    // For now, allowing review on any booking that isn't PENDING might be safer, or just allow it.
    // Let's assume user can only review if status is 'COMPLETED' or similar if that exists,
    // but based on previous files, status defaults to PENDING.
    // I'll skip status check for now to ensure testability unless I see specific status logic.

    if (booking.review) {
      return NextResponse.json(
        { error: "Review already exists for this booking" },
        { status: 409 },
      );
    }

    // Create Review
    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment: comment,
        bookingId: parseInt(bookingId),
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Review Create Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
