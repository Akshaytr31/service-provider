import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Fetch all notifications for the current user
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [userRows] = await db.query("SELECT id FROM users WHERE email = ?", [
      session.user.email,
    ]);

    const user = userRows[0];
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [[notifications], [countRows]] = await Promise.all([
      db.query(
        "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
        [user.id],
      ),
      db.query(
        "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
        [user.id],
      ),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount: countRows[0].count,
    });
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}

// PATCH: Mark notifications as read
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids, all } = await req.json();
    const [userRows] = await db.query("SELECT id FROM users WHERE email = ?", [
      session.user.email,
    ]);

    const user = userRows[0];
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (all) {
      await db.query(
        "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
        [user.id],
      );
    } else if (ids && Array.isArray(ids) && ids.length > 0) {
      const placeholders = ids.map(() => "?").join(",");
      await db.query(
        `UPDATE notifications SET is_read = 1 WHERE id IN (${placeholders}) AND user_id = ?`,
        [...ids, user.id],
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update Notification Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
