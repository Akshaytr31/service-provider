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
      // User Info
      userType,
      firstName,
      lastName,
      // Business
      businessName,
      businessType,
      registrationNumber,
      establishmentYear,
      // Contact
      city,
      zipCode,
      state,
      country,
      address,
      serviceRadius,
      serviceAreas,
      // Service
      categoryId,
      subCategoryId,
      servicesOffered,
      description,
      yearsExperience,
      // Education
      qualifications,
      // License
      licenses,
      // Availability
      availability,
      // Pricing
      pricingType,
      baseRate,
      onSiteCharges,
      paymentMethods,
      // Identity
      idType,
      idNumber,
      backgroundCheckConsent,
      // Legal
      termsAccepted,
      privacyAccepted,
      rulesAccepted,
    } = body;

    // 1. Basic Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // 2. Check overlap
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists with this email" },
        { status: 409 }
      );
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Verify OTP
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

    // 5. Transaction: Create User + Provider Request
    await prisma.$transaction(async (tx) => {
      // Create User
      const newUser = await tx.users.create({
        data: {
          email,
          password: hashedPassword,
          role: "provider",
          name: userType === "individual" ? `${firstName} ${lastName}` : businessName,
          providerRequestStatus: "PENDING",
          isProviderAtFirst: true,
          email_verified: true, 
        },
      });

      // Delete Used OTP
      await tx.emailOtp.delete({
        where: { id: otpRecord.id }
      });

      // Create Provider Request
      await tx.providerRequest.create({
        data: {
          userId: newUser.id,
          userType,
          firstName,
          lastName,
          businessName,
          businessType,
          registrationNumber,
          establishmentYear,
          
          city,
          zipCode,
          state,
          country,
          address,
          serviceRadius: serviceRadius ? parseInt(serviceRadius) : null,
          serviceAreas: serviceAreas || [], // JSON

          subCategoryId: subCategoryId ? parseInt(subCategoryId) : null,
          servicesOffered: servicesOffered || [], // JSON
          description,
          yearsExperience,

          qualifications: qualifications || [],
          licenses: licenses || [],
            
          availability: availability || {},
          
          pricingType,
          baseRate,
          onSiteCharges,
          paymentMethods: paymentMethods || [],

          idType,
          idNumber,
          backgroundCheck: backgroundCheckConsent, // Map 'backgroundCheckConsent' (payload) to 'backgroundCheck' (model)
          // Missing idProofUrl handling (assumed handled elsewhere or optional)

          termsAccepted,
          privacyAccepted,
          rulesAccepted,
          
          status: "PENDING",
        },
      });
    });

    return NextResponse.json(
      { message: "Provider account created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Provider Signup Error:", error);
    // Return the specific error message for debugging purposes
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}
