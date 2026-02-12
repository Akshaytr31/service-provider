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
    const { status } = await req.json();

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Verify ownership (Must be provider of the booking)
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
    });

    if (!booking)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    if (booking.providerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Booking Update Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
