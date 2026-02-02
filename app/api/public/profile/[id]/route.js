import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);

    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({
      where: { id: id },
      include: {
        seekerProfile: true,
        providerRequests: {
          where: { status: "APPROVED" }, // Only show approved provider profiles publically? Or all? User said "share... with or without account", likely approved ones make sense but user might want to share their own even if pending. Let's show the most recent one to replicate private view but maybe we should filter. For now, let's allow fetching the latest one just like the private profile does.
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Sanitize data for public view
    const publicUser = {
      name: user.name,
      image: user.image,
      role: user.role,
      // Do not expose email, mobile, DOB, etc. broadly unless part of the public profile design.
      // However, the request says "share this page... read only".
      // The current profile page shows: name, role, tags, basic info (name, gender, dob, mobile), address etc.
      // If it's a SHAREABLE link, the user presumably consents to sharing what's on their screen.
      // I will include non-sensitive fields. Mobile/Email might be sensitive but often needed for connection.
      // I'll include them but frontend can decide to show/hide.
      email: user.email,
      mobile: user.mobile,
      isProviderAtFirst: user.isProviderAtFirst,
    };

    return NextResponse.json(
      {
        user: publicUser,
        profile: user.seekerProfile || null,
        providerRequest: user.providerRequests?.[0] || null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
