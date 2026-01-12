import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      dateOfBirth,
      otp,
      // The following fields are collected but strictly speaking
      // there is no column in `users` table for them yet, 
      // except dateOfBirth.
      // gender,
      // address,
      // education
    } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Verify OTP
    if (!otp) {
      return NextResponse.json(
        { message: "OTP is required" },
        { status: 400 }
      );
    }

    const otpRecord = await prisma.emailOtp.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord || otpRecord.otp !== otp) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      );
    }

    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json(
        { message: "OTP expired" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
       await tx.users.create({
        data: {
          email,
          password: hashedPassword,
          role: "seeker",
          dateOfBirth: dateOfBirth || null,
          email_verified: true,
        },
      });

      await tx.emailOtp.delete({
        where: { id: otpRecord.id }
      });
    });

    return NextResponse.json(
      { message: "Seeker account created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Seeker Signup Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
