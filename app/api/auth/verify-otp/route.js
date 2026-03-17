import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required" },
        { status: 400 },
      );
    }

    const [rows] = await db.query(
      "SELECT * FROM email_otps WHERE email = ? ORDER BY created_at DESC LIMIT 1",
      [email],
    );

    if (rows.length === 0 || rows[0].otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    const otpRecord = rows[0];

    if (new Date() > new Date(otpRecord.expires_at)) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    // Valid OTP
    return NextResponse.json({ message: "OTP verified" }, { status: 200 });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
