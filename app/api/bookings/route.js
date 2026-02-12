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
    const { serviceId, date, time } = await req.json();

    if (!serviceId || !date || !time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get Seeker User
    const seeker = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!seeker) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check service exists and get provider
    const service = await prisma.services.findUnique({
      where: { id: parseInt(serviceId) },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Find provider user by email
    const provider = await prisma.users.findUnique({
      where: { email: service.providerEmail },
    });

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
    const existing = await prisma.booking.findFirst({
      where: {
        serviceId: parseInt(serviceId),
        date: new Date(date),
        time: time,
        status: { not: "REJECTED" },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Slot already booked" },
        { status: 409 },
      );
    }

    // Create Booking
    const booking = await prisma.booking.create({
      data: {
        seekerId: seeker.id,
        providerId: provider.id,
        serviceId: parseInt(serviceId),
        date: new Date(date),
        time: time,
        status: "PENDING",
      },
    });

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
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [{ seekerId: user.id }, { providerId: user.id }],
      },
      include: {
        seeker: {
          select: { name: true, email: true, image: true, mobile: true },
        },
        provider: { select: { name: true, email: true, id: true } },
        service: { select: { title: true, price: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Add a computed field to indicate if user is provider or seeker for this blocking?
    // Frontend can infer from checking user.id vs providerId.

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Booking Fetch Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
