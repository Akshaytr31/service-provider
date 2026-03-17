import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      otp,
      firstName,
      lastName,
      businessName,
      userType,
    } = body;

    // 1. Validation
    if (!email || !password || !otp) {
      return NextResponse.json(
        { message: "Email, password, and OTP are required" },
        { status: 400 },
      );
    }

    // 2. Check Exists
    const [existingRows] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existingRows.length > 0) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 },
      );
    }

    // 3. Verify OTP
    const [otpRows] = await db.query(
      "SELECT * FROM email_otps WHERE email = ? ORDER BY created_at DESC LIMIT 1",
      [email],
    );

    const otpRecord = otpRows[0];

    if (!otpRecord || otpRecord.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    if (new Date() > new Date(otpRecord.expires_at)) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    // 4. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create User
    const name =
      userType === "individual" ? `${firstName} ${lastName}` : businessName;

    const [result] = await db.query(
      `INSERT INTO users (email, password, name, role, email_verified, isProviderAtFirst, createdAt)
       VALUES (?, ?, ?, 'seeker', 1, 1, NOW())`,
      [email, hashedPassword, name],
    );

    // Delete OTP
    await db.query("DELETE FROM email_otps WHERE id = ?", [otpRecord.id]);

    return NextResponse.json(
      { message: "Account created successfully", userId: result.insertId },
      { status: 201 },
    );
  } catch (error) {
    console.error("Basic Signup Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
