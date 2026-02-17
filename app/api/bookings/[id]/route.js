import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(req, props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = params;
    const { status, cancellationReason } = await req.json();

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Verify ownership (Must be provider of the booking)
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: { service: true },
    });

    if (!booking)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    if (booking.providerId !== user.id) {
      // Allow Seeker to mark as COMPLETED or CANCELLED
      if (
        booking.seekerId === user.id &&
        (status === "COMPLETED" || status === "CANCELLED")
      ) {
        // Allowed
      } else {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const updated = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: {
        status,
        cancellationReason:
          status === "CANCELLED" ? cancellationReason : undefined,
      },
      include: { service: true },
    });

    // Notify Logic
    let message = "";
    let recipientId = null;
    let link = "";

    if (status === "CONFIRMED") {
      message = `Good news! Your booking for "${booking.service.title}" on ${new Date(booking.date).toLocaleDateString()} at ${booking.time} has been accepted.`;
      recipientId = booking.seekerId;
      link = "/seeker/bookings";
    } else if (status === "REJECTED") {
      message = `Your booking request for "${booking.service.title}" has been rejected.`;
      recipientId = booking.seekerId;
      link = "/seeker/bookings";
    } else if (status === "COMPLETED") {
      // If Provider marks completed (rare if flow is Seeker focused, but supported)
      message = `Your booking for "${booking.service.title}" has been marked as completed. Please leave a review!`;
      recipientId = booking.seekerId;
      link = "/seeker/bookings";
    } else if (status === "CANCELLED") {
      // Determine who cancelled to notify the other party
      if (user.id === booking.seekerId) {
        // Seeker cancelled -> Notify Provider
        recipientId = booking.providerId;
        message = `Booking for "${booking.service.title}" was cancelled by the seeker. Reason: ${cancellationReason || "No reason provided"}`;
        link = "/providerDashboard?view=requests&status=ALL";
      } else {
        // Provider cancelled -> Notify Seeker
        recipientId = booking.seekerId;
        message = `Your booking for "${booking.service.title}" was cancelled by the provider. Reason: ${cancellationReason || "No reason provided"}`;
        link = "/seeker/bookings";
      }
    }

    if (recipientId && message) {
      await prisma.notification.create({
        data: {
          userId: recipientId,
          message,
          type: "BOOKING_UPDATE",
          isRead: false,
          link,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Booking Update Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
