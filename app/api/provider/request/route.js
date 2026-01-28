// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { db } from "@/lib/db";
// import { NextResponse } from "next/server";

// export async function POST() {
//   const session = await getServerSession(authOptions);

//   if (!session?.user?.email) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   await db.query(
//     "UPDATE users SET providerRequestStatus = 'pending' WHERE email = ?",
//     [session.user.email]
//   );

//   return NextResponse.json({ success: true });
// }

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      user = await prisma.users.create({
        data: {
          email: session.user.email,
          name: session.user.name || "User",
          role: "seeker",
        },
      });
    }

    const body = await req.json();

    const request = await prisma.providerRequest.create({
      data: {
        userId: user.id,
        about: body.about,
        education: body.education,
        experience: body.experience,
        skills: body.skills,
        certificates: body.certificates,
        profilePhoto: body.profilePhoto || null,
        status: "PENDING",
        createdAt: new Date(),
      },
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error("PRISMA ERROR:", error);
    return NextResponse.json(
      { error: "Failed to send request", message: error.message },
      { status: 500 },
    );
  }
}
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { licenses, licenseIndex } = body;

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      include: {
        providerRequests: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user || !user.providerRequests?.[0]) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const providerRequestId = user.providerRequests[0].id;

    // If we are updating a specific license in the array
    let updatedLicenses = user.providerRequests[0].licenses || [];

    // Ensure licenses is an array
    if (!Array.isArray(updatedLicenses)) {
      updatedLicenses = [];
    }

    if (licenses) {
      // If a full list is provided (or a single object to replace/append)
      // For this specific requirement "update expiry/document", we might receive the whole updated list OR a specific update.
      // Let's assume the frontend sends the COMPLETE updated licenses array for simplicity and robustness.
      updatedLicenses = licenses;
    }

    const updatedRequest = await prisma.providerRequest.update({
      where: { id: providerRequestId },
      data: {
        licenses: updatedLicenses,
      },
    });

    return NextResponse.json(updatedRequest, { status: 200 });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update request", message: error.message },
      { status: 500 },
    );
  }
}
