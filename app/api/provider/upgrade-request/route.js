import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      // User Info
      userType,
      firstName,
      lastName,
      // Business
      businessName,
      businessType,
      registrationNumber,
      trnNumber,
      expiryDate,
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

    // Basic Validation (checking a few key fields)
    if (!userType || !termsAccepted) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if request already exists?
    const existingRequest = await prisma.providerRequest.findFirst({
      where: { userId: Number(session.user.id) },
    });

    if (existingRequest && existingRequest.status === "PENDING") {
      return NextResponse.json(
        { message: "You already have a pending provider request." },
        { status: 409 }
      );
    }

    // Transaction: Create Request + Update User
    await prisma.$transaction(async (tx) => {
      // Create Provider Request
      await tx.providerRequest.create({
        data: {
          userId: Number(session.user.id),
          userType,
          firstName,
          lastName,
          businessName,
          businessType,
          registrationNumber,
          trnNumber,
          businessExpiryDate: expiryDate,
          establishmentYear,

          city,
          zipCode,
          state,
          country,
          address,
          serviceRadius: serviceRadius ? parseInt(serviceRadius) : null,
          serviceAreas: serviceAreas || [],

          subCategoryId: subCategoryId ? parseInt(subCategoryId) : null,
          servicesOffered: servicesOffered || [],
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
          backgroundCheck: backgroundCheckConsent,

          termsAccepted,
          privacyAccepted,
          rulesAccepted,

          status: "PENDING",
        },
      });

      // Update User Status
      await tx.users.update({
        where: { id: Number(session.user.id) },
        data: {
          providerRequestStatus: "PENDING",
        },
      });
    });

    return NextResponse.json(
      { message: "Provider request submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Provider Upgrade Error:", error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}
