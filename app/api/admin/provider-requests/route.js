import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/* ================= GET ALL REQUESTS ================= */
export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT pr.*, u.id AS userId, u.email AS userEmail, u.name AS userName
       FROM provider_requests pr
       LEFT JOIN users u ON pr.user_id = u.id
       ORDER BY pr.created_at DESC`,
    );

    // Parse JSON columns and nest user object
    const requests = rows.map((row) => {
      const jsonCols = [
        "licenses",
        "qualifications",
        "availability",
        "payment_methods",
        "service_areas",
        "services_offered",
        "gallery",
      ];
      for (const col of jsonCols) {
        if (row[col] && typeof row[col] === "string") {
          try {
            row[col] = JSON.parse(row[col]);
          } catch {}
        }
      }

      return {
        ...row,
        user: {
          id: row.userId,
          email: row.userEmail,
          name: row.userName,
        },
        // Clean up flat user fields
        userId: undefined,
        userEmail: undefined,
        userName: undefined,
      };
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("GET PROVIDER REQUESTS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch provider requests" },
      { status: 500 },
    );
  }
}
