import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { otp } = await req.json();
    const email = session.user.email;

    if (!otp) {
      return NextResponse.json(
        { message: "OTP is required" },
        { status: 400 }
      );
    }

    const [rows] = await db.query(
      "SELECT otp, expires_at FROM email_otps WHERE email = ? ORDER BY id DESC LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      );
    }

    const record = rows[0];

    if (record.otp !== otp) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      );
    }

    if (new Date(record.expires_at) < new Date()) {
      return NextResponse.json(
        { message: "OTP expired" },
        { status: 400 }
      );
    }

    await db.query(
      "UPDATE users SET email_verified = true WHERE email = ?",
      [email]
    );

    await db.query(
      `UPDATE provider_requests 
       SET status = 'PENDING'
       WHERE user_id = (SELECT id FROM users WHERE email = ?)`,
      [email]
    );

    await db.query(
      "DELETE FROM email_otps WHERE email = ?",
      [email]
    );

    return NextResponse.json({
      message: "Email verified and onboarding completed"
    });

  } catch (err) {
    console.error("Verify OTP Error:", err);
    return NextResponse.json(
      { message: "Verification failed" },
      { status: 500 }
    );
  }
}
