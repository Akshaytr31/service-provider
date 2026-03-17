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
    const { serviceId, date, time } = await req.json();

    if (!serviceId || !date || !time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get Seeker User
    const [seekerRows] = await db.query("SELECT * FROM users WHERE email = ?", [
      session.user.email,
    ]);
    const seeker = seekerRows[0];

    if (!seeker) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check service exists and get provider
    const [serviceRows] = await db.query(
      "SELECT * FROM services WHERE id = ?",
      [parseInt(serviceId)],
    );
    const service = serviceRows[0];

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Find provider user by email
    const [providerRows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [service.providerEmail],
    );
    const provider = providerRows[0];

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 },
      );
    }

    // Prevent booking own service
    if (provider.id === seeker.id) {
      return NextResponse.json(
        { error: "Cannot book your own service" },
        { status: 400 },
      );
    }

    // Check if slot is taken
    const [existingRows] = await db.query(
      "SELECT id FROM bookings WHERE service_id = ? AND date = ? AND time = ? AND status = 'CONFIRMED'",
      [parseInt(serviceId), new Date(date), time],
    );

    if (existingRows.length > 0) {
      return NextResponse.json(
        { error: "Slot already booked" },
        { status: 409 },
      );
    }

    // Create Booking
    const [bookingResult] = await db.query(
      `INSERT INTO bookings (seeker_id, provider_id, service_id, date, time, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'PENDING', NOW())`,
      [seeker.id, provider.id, parseInt(serviceId), new Date(date), time],
    );

    // Notify Provider
    await db.query(
      `INSERT INTO notifications (user_id, message, type, is_read, link, created_at)
       VALUES (?, ?, 'BOOKING_REQUEST', 0, ?, NOW())`,
      [
        provider.id,
        `New booking request for "${service.title}" on ${new Date(date).toLocaleDateString()} at ${time}`,
        `/providerDashboard?view=requests&status=PENDING`,
      ],
    );

    // Return the created booking with service info
    const [bookingRows] = await db.query(
      `SELECT b.*, s.title AS serviceTitle, s.price AS servicePrice
       FROM bookings b
       LEFT JOIN services s ON b.service_id = s.id
       WHERE b.id = ?`,
      [bookingResult.insertId],
    );

    const booking = bookingRows[0];
    booking.service = {
      title: booking.serviceTitle,
      price: booking.servicePrice,
    };

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Booking Create Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

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

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    let whereClause = "(b.seeker_id = ? OR b.provider_id = ?)";
    let params = [user.id, user.id];

    if (role === "provider") {
      whereClause = "b.provider_id = ?";
      params = [user.id];
    } else if (role === "seeker") {
      whereClause = "b.seeker_id = ?";
      params = [user.id];
    }

    const [bookings] = await db.query(
      `SELECT 
        b.*,
        seeker.id AS seekerId, seeker.name AS seekerName, seeker.email AS seekerEmail, seeker.image AS seekerImage, seeker.mobile AS seekerMobile,
        provider.name AS providerName, provider.email AS providerEmail, provider.id AS providerUserId, provider.image AS providerImage,
        s.title AS serviceTitle, s.price AS servicePrice, s.coverPhoto AS serviceCoverPhoto, s.sub_category_id AS serviceSubCategoryId,
        r.id AS reviewId, r.rating AS reviewRating, r.comment AS reviewComment, r.created_at AS reviewCreatedAt, r.booking_id AS reviewBookingId
       FROM bookings b
       LEFT JOIN users seeker ON b.seeker_id = seeker.id
       LEFT JOIN users provider ON b.provider_id = provider.id
       LEFT JOIN services s ON b.service_id = s.id
       LEFT JOIN reviews r ON r.booking_id = b.id
       WHERE ${whereClause}
       ORDER BY b.created_at DESC`,
      params,
    );

    // Get subcategory → category names for services
    const subCategoryIds = [
      ...new Set(bookings.map((b) => b.serviceSubCategoryId).filter(Boolean)),
    ];
    let categoryMap = {};

    if (subCategoryIds.length > 0) {
      const placeholders = subCategoryIds.map(() => "?").join(",");
      const [subCats] = await db.query(
        `SELECT sc.id, c.name AS categoryName
         FROM sub_categories sc
         LEFT JOIN categories c ON sc.category_id = c.id
         WHERE sc.id IN (${placeholders})`,
        subCategoryIds,
      );
      for (const sc of subCats) {
        categoryMap[sc.id] = sc.categoryName;
      }
    }

    // Reshape into nested objects matching Prisma's include format
    const result = bookings.map((b) => ({
      id: b.id,
      seekerId: b.seeker_id,
      providerId: b.provider_id,
      serviceId: b.service_id,
      date: b.date,
      time: b.time,
      status: b.status,
      createdAt: b.created_at,
      cancellationReason: b.cancellationReason,
      seeker: {
        id: b.seekerId,
        name: b.seekerName,
        email: b.seekerEmail,
        image: b.seekerImage,
        mobile: b.seekerMobile,
      },
      provider: {
        name: b.providerName,
        email: b.providerEmail,
        id: b.providerUserId,
        image: b.providerImage,
      },
      service: {
        title: b.serviceTitle,
        price: b.servicePrice,
        coverPhoto: b.serviceCoverPhoto,
        subCategory: {
          category: {
            name: categoryMap[b.serviceSubCategoryId] || null,
          },
        },
      },
      review: b.reviewId
        ? {
            id: b.reviewId,
            rating: b.reviewRating,
            comment: b.reviewComment,
            createdAt: b.reviewCreatedAt,
            bookingId: b.reviewBookingId,
          }
        : null,
    }));

    console.log(`API: Fetching bookings for ${session.user.email}`);
    console.log(`Found ${result.length} bookings.`);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Booking Fetch Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
