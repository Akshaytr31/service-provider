import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { randomInt } from "crypto";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    const otp = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.query("DELETE FROM email_otps WHERE email = ?", [email]);
    await db.query(
      "INSERT INTO email_otps (email, otp, expires_at) VALUES (?, ?, ?)",
      [email, otp, expiresAt]
    );

    const { sendEmail } = await import("@/lib/mail");
    await sendEmail(email, "Email Verification OTP", `Your OTP is ${otp}`);

    return NextResponse.json({ message: "OTP sent" });
  } catch (err) {
    return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 });
  }
}
