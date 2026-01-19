import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Verify OTP
    const [otpRow] = await db.query(
      "SELECT * FROM email_otps WHERE email = ? AND otp = ?",
      [email, otp]
    );

    if (otpRow.length === 0) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    // Check expiry
    const now = new Date();
    if (new Date(otpRow[0].expires_at) < now) {
      return NextResponse.json({ message: "OTP has expired" }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query("UPDATE users SET password = ? WHERE email = ?", [
      hashedPassword,
      email,
    ]);

    // Delete used OTP
    await db.query("DELETE FROM email_otps WHERE email = ?", [email]);

    return NextResponse.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
