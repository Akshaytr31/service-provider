import { prisma } from "@/lib/prisma";
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
      userType
    } = body;

    // 1. Validation
    if (!email || !password || !otp) {
      return NextResponse.json(
        { message: "Email, password, and OTP are required" },
        { status: 400 }
      );
    }

    // 2. Check Exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    // 3. Verify OTP
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

    // 4. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create User
    // Role is "seeker" (or standard user) initially. 
    // They become "provider" only after Admin approval.
    // However, they are expressing intent to be provider, so we can set isProviderAtFirst = true? 
    // Actually, user wants them to just "be a user" then "become a provider".
    // I will set role="seeker" for now to check `isProviderAtFirst` logic.
    // Wait, prompt said: "Create a basic user account (Role: Seeker/User) for providers starting onboarding".
    
    // Name logic
    const name = userType === "individual" ? `${firstName} ${lastName}` : businessName;

    const newUser = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "seeker", 
        email_verified: true,
        isProviderAtFirst: true, // They are signing up via provider flow
      },
    });

    // Delete OTP
    await prisma.emailOtp.delete({ where: { id: otpRecord.id } });

    return NextResponse.json(
      { message: "Account created successfully", userId: newUser.id },
      { status: 201 }
    );

  } catch (error) {
    console.error("Basic Signup Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
