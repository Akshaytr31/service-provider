import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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

  // Try Provider Request
  if (user.providerRequest) {
    if (user.providerRequest.business_name)
      return user.providerRequest.business_name;
    return (
      `${user.providerRequest.first_name || ""} ${user.providerRequest.last_name || ""}`.trim() ||
      "Unknown Provider"
    );
  }

  return "Unknown User";
}

// Helper to resolve profile image
function getProfileImage(user) {
  if (user.providerRequest && user.providerRequest.profile_photo) {
    return user.providerRequest.profile_photo;
  }
  return user.image;
}

// Helper to enrich a user object with seekerProfile and providerRequest
async function enrichUser(userId) {
  const [userRows] = await db.query("SELECT * FROM users WHERE id = ?", [
    userId,
  ]);
  const user = userRows[0];
  if (!user) return null;

  const [spRows] = await db.query(
    "SELECT * FROM SeekerProfile WHERE userId = ? LIMIT 1",
    [userId],
  );
  user.seekerProfile = spRows[0] || null;

  const [prRows] = await db.query(
    "SELECT * FROM provider_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
    [userId],
  );
  user.providerRequest = prRows[0] || null;

  return user;
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
    if (otherUserId) {
      const otherId = parseInt(otherUserId);

      let query = `SELECT * FROM messages
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)`;
      let params = [currentUserId, otherId, otherId, currentUserId];

      if (lastId) {
        query += " AND id > ?";
        params.push(parseInt(lastId));
      }

      query += " ORDER BY created_at ASC";

      const [messages] = await db.query(query, params);

      // Enrich unique user IDs
      const userIds = [
        ...new Set(messages.flatMap((m) => [m.sender_id, m.receiver_id])),
      ];
      const userCache = {};
      for (const uid of userIds) {
        userCache[uid] = await enrichUser(uid);
      }

      const mappedMessages = messages.map((msg) => {
        const sender = userCache[msg.sender_id];
        const receiver = userCache[msg.receiver_id];
        return {
          ...msg,
          sender: sender
            ? {
                ...sender,
                name: getDisplayName(sender),
                image: getProfileImage(sender),
              }
            : null,
          receiver: receiver
            ? {
                ...receiver,
                name: getDisplayName(receiver),
                image: getProfileImage(receiver),
              }
            : null,
        };
      });

      return NextResponse.json(mappedMessages);
    } else {
      // Fetch list of active conversations
      const [messages] = await db.query(
        `SELECT * FROM messages
         WHERE sender_id = ? OR receiver_id = ?
         ORDER BY created_at DESC`,
        [currentUserId, currentUserId],
      );

      // Enrich unique user IDs
      const userIds = [
        ...new Set(messages.flatMap((m) => [m.sender_id, m.receiver_id])),
      ];
      const userCache = {};
      for (const uid of userIds) {
        userCache[uid] = await enrichUser(uid);
      }

      const partners = new Map();

      for (const msg of messages) {
        const isSender = msg.sender_id === currentUserId;
        const partnerId = isSender ? msg.receiver_id : msg.sender_id;
        const partnerUser = userCache[partnerId];

        if (!partners.has(partnerId)) {
          const resolvedPartner = partnerUser
            ? {
                ...partnerUser,
                name: getDisplayName(partnerUser),
                image: getProfileImage(partnerUser),
              }
            : { id: partnerId, name: "Unknown User" };

          partners.set(partnerId, {
            id: partnerId,
            user: resolvedPartner,
            lastMessage: msg.content,
            timestamp: msg.created_at,
            unreadCount: 0,
          });
        }

        if (!isSender && !msg.is_read) {
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

    await db.query(
      "UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0",
      [parseInt(senderId), currentUserId],
    );

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

    const senderId = parseInt(session.user.id);

    const [result] = await db.query(
      `INSERT INTO messages (content, sender_id, receiver_id, created_at)
       VALUES (?, ?, ?, NOW())`,
      [content, senderId, parseInt(receiverId)],
    );

    // Fetch the created message with sender info
    const [msgRows] = await db.query("SELECT * FROM messages WHERE id = ?", [
      result.insertId,
    ]);

    const sender = await enrichUser(senderId);

    const mappedMessage = {
      ...msgRows[0],
      sender: sender
        ? {
            ...sender,
            name: getDisplayName(sender),
            image: getProfileImage(sender),
          }
        : null,
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
