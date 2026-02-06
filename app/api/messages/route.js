import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route"; // Adjust path if needed
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Fetch messages for the current user
// Supports query params: ?otherUserId=123 (fetch conversation with specific user)
// OR ?conversations=true (fetch list of recent conversations - simplified for now)
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const otherUserId = searchParams.get("otherUserId");
  const lastId = searchParams.get("lastId"); // For polling optimization

  const currentUserId = parseInt(session.user.id);

  try {
    if (otherUserId) {
      // Fetch messages between current user and other user
      const otherId = parseInt(otherUserId);

      const whereClause = {
        OR: [
          { senderId: currentUserId, receiverId: otherId },
          { senderId: otherId, receiverId: currentUserId },
        ],
      };

      if (lastId) {
        whereClause.id = { gt: parseInt(lastId) };
      }

      const messages = await prisma.message.findMany({
        where: whereClause,
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true, image: true } },
          receiver: { select: { id: true, name: true, image: true } },
        },
      });

      return NextResponse.json(messages);
    } else {
      // Fetch list of active conversations (simplified: just latest messages grouped)
      // For V1, we might just return empty or handle this client-side if needed.
      // But let's basic implementation: find distinct users messaged with.
      const messages = await prisma.message.findMany({
        where: {
          OR: [{ senderId: currentUserId }, { receiverId: currentUserId }],
        },
        orderBy: { createdAt: "desc" },
        distinct: ["senderId", "receiverId"], // This might not be perfect for conversation list but okay for V1
        include: {
          sender: { select: { id: true, name: true, image: true } },
          receiver: { select: { id: true, name: true, image: true } },
        },
      });

      // Post-process to get unique conversation partners
      // This is a bit naive but works for small scale
      const partners = new Map();
      messages.forEach((msg) => {
        const partner =
          msg.senderId === currentUserId ? msg.receiver : msg.sender;
        if (!partners.has(partner.id)) {
          partners.set(partner.id, {
            ...partner,
            lastMessage: msg.content,
            timestamp: msg.createdAt,
          });
        }
      });

      return NextResponse.json(Array.from(partners.values()));
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST: Send a new message
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { receiverId, content } = await req.json();

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "Missing receiverId or content" },
        { status: 400 },
      );
    }

    const newMessage = await prisma.message.create({
      data: {
        content,
        senderId: parseInt(session.user.id),
        receiverId: parseInt(receiverId),
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
