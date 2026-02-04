import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find provider request for this user
    const providerRequest = await prisma.providerRequest.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!providerRequest) {
      return NextResponse.json(
        { error: "No provider request found" },
        { status: 404 },
      );
    }

    const messages = await prisma.clarification.findMany({
      where: { providerRequestId: providerRequest.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { message } = await req.json();

    const providerRequest = await prisma.providerRequest.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!providerRequest) {
      return NextResponse.json(
        { error: "No provider request found" },
        { status: 404 },
      );
    }

    const newMessage = await prisma.clarification.create({
      data: {
        providerRequestId: providerRequest.id,
        message,
        sender: "PROVIDER",
      },
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
