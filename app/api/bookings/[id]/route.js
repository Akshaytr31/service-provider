import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req, props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = params;
    const { status, cancellationReason } = await req.json();

    const [userRows] = await db.query("SELECT id FROM users WHERE email = ?", [
      session.user.email,
    ]);
    const user = userRows[0];
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Verify ownership (Must be provider of the booking)
    const [bookingRows] = await db.query(
      `SELECT b.*, s.title AS serviceTitle
       FROM bookings b
       LEFT JOIN services s ON b.service_id = s.id
       WHERE b.id = ?`,
      [parseInt(id)],
    );
    const booking = bookingRows[0];

    if (!booking)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    if (booking.provider_id !== user.id) {
      if (
        booking.seeker_id === user.id &&
        (status === "COMPLETED" || status === "CANCELLED")
      ) {
        // Allowed
      } else {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const updateFields = ["status = ?"];
    const updateValues = [status];

    if (status === "CANCELLED" && cancellationReason) {
      updateFields.push("cancellationReason = ?");
      updateValues.push(cancellationReason);
    }

    updateValues.push(parseInt(id));

    await db.query(
      `UPDATE bookings SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues,
    );

    // Fetch updated booking
    const [updatedRows] = await db.query(
      `SELECT b.*, s.title AS serviceTitle, s.price AS servicePrice
       FROM bookings b
       LEFT JOIN services s ON b.service_id = s.id
       WHERE b.id = ?`,
      [parseInt(id)],
    );
    const updated = updatedRows[0];
    updated.service = {
      title: updated.serviceTitle,
      price: updated.servicePrice,
    };

    // Notify Logic
    let message = "";
    let recipientId = null;
    let link = "";

    if (status === "CONFIRMED") {
      message = `Good news! Your booking for "${booking.serviceTitle}" on ${new Date(booking.date).toLocaleDateString()} at ${booking.time} has been accepted.`;
      recipientId = booking.seeker_id;
      link = "/seeker/bookings";
    } else if (status === "REJECTED") {
      message = `Your booking request for "${booking.serviceTitle}" has been rejected.`;
      recipientId = booking.seeker_id;
      link = "/seeker/bookings";
    } else if (status === "COMPLETED") {
      message = `Your booking for "${booking.serviceTitle}" has been marked as completed. Please leave a review!`;
      recipientId = booking.seeker_id;
      link = "/seeker/bookings";
    } else if (status === "CANCELLED") {
      if (user.id === booking.seeker_id) {
        recipientId = booking.provider_id;
        message = `Booking for "${booking.serviceTitle}" was cancelled by the seeker. Reason: ${cancellationReason || "No reason provided"}`;
        link = "/providerDashboard?view=requests&status=ALL";
      } else {
        recipientId = booking.seeker_id;
        message = `Your booking for "${booking.serviceTitle}" was cancelled by the provider. Reason: ${cancellationReason || "No reason provided"}`;
        link = "/seeker/bookings";
      }
    }

    if (recipientId && message) {
      await db.query(
        `INSERT INTO notifications (user_id, message, type, is_read, link, created_at)
         VALUES (?, ?, 'BOOKING_UPDATE', 0, ?, NOW())`,
        [recipientId, message, link],
      );
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
