import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { transporter } from "@/lib/mailer";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const [users] = await db.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return NextResponse.json(
        { message: "No account found with this email" },
        { status: 404 }
      );
    }

    const otp = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Clear old OTPs for this email
    await db.query("DELETE FROM email_otps WHERE email = ?", [email]);

    // Store new OTP
    await db.query(
      "INSERT INTO email_otps (email, otp, expires_at) VALUES (?, ?, ?)",
      [email, otp, expiresAt]
    );

    // Send Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2b6cb0;">Password Reset</h2>
          <p>You requested a password reset. Use the OTP below to proceed:</p>
          <div style="font-size: 24px; font-weight: bold; background: #f7fafc; padding: 10px; text-align: center; border-radius: 4px; border: 1px dashed #cbd5e0;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #718096; margin-top: 20px;">
            This OTP will expire in 10 minutes. If you did not request this, please ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
