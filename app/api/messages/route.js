import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route"; // Adjust path if needed
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to resolve display name
function getDisplayName(user) {
  if (user.name) return user.name;

  // Try Seeker Profile
  if (user.seekerProfile) {
    if (user.seekerProfile.userType === "business") {
      return user.seekerProfile.businessName || "Unknown Business";
    }
    return (
      `${user.seekerProfile.firstName || ""} ${user.seekerProfile.lastName || ""}`.trim() ||
      "Unknown Individual"
    );
  }

  // Try Provider Request (take the first one)
  if (user.providerRequests && user.providerRequests.length > 0) {
    const req = user.providerRequests[0];
    if (req.businessName) return req.businessName;
    return (
      `${req.firstName || ""} ${req.lastName || ""}`.trim() ||
      "Unknown Provider"
    );
  }

  return "Unknown User";
}

// GET: Fetch messages for the current user
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const otherUserId = searchParams.get("otherUserId");
  const lastId = searchParams.get("lastId");

  const currentUserId = parseInt(session.user.id);

  try {
    const commonInclude = {
      sender: {
        include: {
          seekerProfile: true,
          providerRequests: true,
        },
      },
      receiver: {
        include: {
          seekerProfile: true,
          providerRequests: true,
        },
      },
    };

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
        include: commonInclude,
      });

      // Map messages to include resolved names
      const mappedMessages = messages.map((msg) => ({
        ...msg,
        sender: {
          ...msg.sender,
          name: getDisplayName(msg.sender),
        },
        receiver: {
          ...msg.receiver,
          name: getDisplayName(msg.receiver),
        },
      }));

      return NextResponse.json(mappedMessages);
    } else {
      // Fetch list of active conversations
      const messages = await prisma.message.findMany({
        where: {
          OR: [{ senderId: currentUserId }, { receiverId: currentUserId }],
        },
        orderBy: { createdAt: "desc" },
        // distinct: ["senderId", "receiverId"], // Can't easily use distinct with complex ordering/filtering in all DBs safely for this logic
        // Better to fetch recent messages and group manually to get accurate counts
        include: commonInclude,
      });

      const partners = new Map();

      // Process messages to group by partner
      for (const msg of messages) {
        const isSender = msg.senderId === currentUserId;
        const partnerUser = isSender ? msg.receiver : msg.sender;
        const partnerId = partnerUser.id;

        if (!partners.has(partnerId)) {
          const resolvedPartner = {
            ...partnerUser,
            name: getDisplayName(partnerUser),
          };

          partners.set(partnerId, {
            id: partnerId,
            user: resolvedPartner,
            lastMessage: msg.content,
            timestamp: msg.createdAt,
            unreadCount: 0,
          });
        }

        // Count unread: if I am receiver and message is not read
        if (!isSender && !msg.isRead) {
          const partnerData = partners.get(partnerId);
          partnerData.unreadCount += 1;
        }
      }

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

// PUT: Mark messages as read
export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { senderId } = await req.json();
    const currentUserId = parseInt(session.user.id);

    if (!senderId) {
      return NextResponse.json({ error: "Missing senderId" }, { status: 400 });
    }

    await prisma.message.updateMany({
      where: {
        senderId: parseInt(senderId),
        receiverId: currentUserId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
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
        sender: {
          include: {
            seekerProfile: true,
            providerRequests: true,
          },
        },
      },
    });

    // Map response
    const mappedMessage = {
      ...newMessage,
      sender: {
        ...newMessage.sender,
        name: getDisplayName(newMessage.sender),
      },
    };

    return NextResponse.json(mappedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
