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
          where: { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let providerRequest = user.providerRequests?.[0] || null;

    if (providerRequest) {
      // 1. Resolve Primary Subcategory manually
      if (providerRequest.subCategoryId) {
        const subCat = await prisma.subCategory.findUnique({
          where: { id: providerRequest.subCategoryId },
          include: { category: true },
        });
        providerRequest.subCategory = subCat;
      }

      // 2. Resolve additional subcategories for servicesOffered if they exist
      if (providerRequest.servicesOffered) {
        const services = Array.isArray(providerRequest.servicesOffered)
          ? providerRequest.servicesOffered
          : [];

        const subCategoryIds = services
          .map((s) => parseInt(s.subCategoryId))
          .filter((id) => !isNaN(id));

        if (subCategoryIds.length > 0) {
          const subCategories = await prisma.subCategory.findMany({
            where: { id: { in: subCategoryIds } },
            include: { category: true },
          });

          providerRequest.servicesOffered = services.map((s) => {
            const subCat = subCategories.find(
              (sc) => sc.id === parseInt(s.subCategoryId),
            );
            return {
              ...s,
              subCategoryName: subCat?.name || "Unknown Service",
              categoryName: subCat?.category?.name || "Other",
            };
          });
        }
      }
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
        providerRequest: providerRequest,
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
