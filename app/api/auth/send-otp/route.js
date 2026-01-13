import { db } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { transporter } from "@/lib/mailer";

export async function POST(req) {
  try {
    const token = await getToken({ req });
    let email = token?.email;

    if (!email) {
      const body = await req.json();
      email = body?.email;
    }

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const otp = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.query("DELETE FROM email_otps WHERE email = ?", [email]);

    await db.query(
      "INSERT INTO email_otps (email, otp, expires_at) VALUES (?, ?, ?)",
      [email, otp, expiresAt]
    );

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Verification Code",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    });

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP Error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to send OTP" },
      { status: 500 }
    );
  }
}

