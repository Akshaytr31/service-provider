import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      email,
      password,
      userType,

      // Individual
      firstName,
      lastName,
      idType,
      idNumber,
      backgroundCheckConsent,

      // Business
      businessName,
      businessType,
      registrationNumber,
      establishmentYear,
      trnNumber,
      businessExpiryDate,

      // Education
      education,

      // Common
      gender,
      address,
      city,
      zipCode,
      state,
      country,
      acceptedTermsandconditions,
    } = body;

    /* ================= BASIC VALIDATION ================= */

    if (!email || !password || !userType) {
      return NextResponse.json(
        { message: "Invalid signup payload" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
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

    /* ================= TRANSACTION ================= */

    await prisma.$transaction(async (tx) => {
      // 1️⃣ Create user
      const user = await tx.users.create({
        data: {
          email,
          password: hashedPassword,
          role: "seeker",
          email_verified: true,
        },
      });

      // 2️⃣ Create seeker profile
      await tx.seekerProfile.create({
        data: {
          userId: user.id,
          userType,

          // Individual fields
          ...(userType === "individual" && {
            firstName: firstName || null,
            lastName: lastName || null,
            idType: idType || null,
            idNumber: idNumber || null,
            backgroundCheck: backgroundCheckConsent || false,
            qualifications: education ? [education] : null,
            fieldOfStudy: education?.field || null,
            institution: education?.institution || null,
            year: education?.year || null,
          }),

          // Business fields
          ...(userType === "business" && {
            businessName: businessName || null,
            businessType: businessType || null,
            registrationNumber: registrationNumber || null,
            establishmentYear: establishmentYear || null,
            trnNumber: trnNumber || null,
            businessExpiryDate: businessExpiryDate || null,
          }),

          // Common
          gender: gender || null,
          address: address || null,
          city: city || null,
          zipCode: zipCode || null,
          state: state || null,
          country: country || null,
          acceptedTermsandconditions: acceptedTermsandconditions || false,
        },
      });
    });

    return NextResponse.json(
      { message: "Seeker account created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
