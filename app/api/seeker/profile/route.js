import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      include: {
        seekerProfile: true,
        providerRequests: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userData = {
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      dateOfBirth: user.dateOfBirth,
      image: user.image,
      isProviderAtFirst: user.isProviderAtFirst,
    };

    return NextResponse.json(
      {
        user: userData,
        profile: user.seekerProfile || null,
        providerRequest: user.providerRequests?.[0] || null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching seeker profile:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Updating Seeker Profile:", JSON.stringify(body, null, 2));

    const {
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
      // Common
      gender,
      address,
      city,
      zipCode,
      state,
      country,
      // Education
      education,
      acceptedTermsandconditions,
    } = body;

    const userEmail = session.user.email;

    await prisma.$transaction(async (tx) => {
      // 1. Get User
      const user = await tx.users.findUnique({
        where: { email: userEmail },
      });

      if (!user) throw new Error("User not found");

      // 2. Update User Role if needed (Transition from 'none' -> 'seeker')
      if (user.role === "none" || user.role === "new_user") {
        await tx.users.update({
          where: { email: userEmail },
          data: { role: "seeker" },
        });
      }

      // 3. Prepare Profile Data
      const profileData = {
        userId: user.id, // Ensure we link to the correct user
        userType,
        gender: gender || null,
        address: address || null,
        city: city || null,
        zipCode: zipCode || null,
        state: state || null,
        country: country || null,
        acceptedTermsandconditions: acceptedTermsandconditions || false,
      };

      if (userType === "individual") {
        Object.assign(profileData, {
          firstName: firstName || null,
          lastName: lastName || null,
          idType: idType || null,
          idNumber: idNumber || null,
          backgroundCheck: backgroundCheckConsent || false,
          qualifications: education ? [education] : null,
          fieldOfStudy: education?.field || null,
          institution: education?.institution || null,
          year: education?.year || null,
        });
      } else if (userType === "business") {
        Object.assign(profileData, {
          businessName: businessName || null,
          businessType: businessType || null,
          registrationNumber: registrationNumber || null,
          establishmentYear: establishmentYear || null,
          trnNumber: trnNumber || null,
          businessExpiryDate: businessExpiryDate || null,
        });
      }

      // 4. Upsert Seeker Profile
      await tx.seekerProfile.upsert({
        where: { userId: user.id },
        create: profileData,
        update: profileData,
      });
    });

    return NextResponse.json(
      { message: "Profile updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating seeker profile:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}
