import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id: idParam } = await params;
    const isId = /^\d+$/.test(idParam);

    let userQuery, userParams;
    if (isId) {
      userQuery = "SELECT * FROM users WHERE id = ?";
      userParams = [parseInt(idParam)];
    } else {
      userQuery = "SELECT * FROM users WHERE slug = ?";
      userParams = [idParam];
    }

    const [userRows] = await db.query(userQuery, userParams);
    const user = userRows[0];

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Fetch seeker profile
    const [spRows] = await db.query(
      "SELECT * FROM SeekerProfile WHERE userId = ? LIMIT 1",
      [user.id],
    );
    const seekerProfile = spRows[0] || null;

    // Fetch approved provider request (latest)
    const [prRows] = await db.query(
      "SELECT * FROM provider_requests WHERE user_id = ? AND status = 'APPROVED' ORDER BY created_at DESC LIMIT 1",
      [user.id],
    );
    let providerRequest = prRows[0] || null;

    // Parse JSON columns on provider request
    if (providerRequest) {
      const jsonCols = [
        "licenses",
        "qualifications",
        "availability",
        "payment_methods",
        "service_areas",
        "services_offered",
        "gallery",
      ];
      for (const col of jsonCols) {
        if (providerRequest[col] && typeof providerRequest[col] === "string") {
          try {
            providerRequest[col] = JSON.parse(providerRequest[col]);
          } catch {}
        }
      }

      // 1. Resolve Primary Subcategory
      if (providerRequest.sub_category_id) {
        const [subCatRows] = await db.query(
          `SELECT sc.*, c.id AS categoryId, c.name AS categoryName, c.image AS categoryImage
           FROM sub_categories sc
           LEFT JOIN categories c ON sc.category_id = c.id
           WHERE sc.id = ?`,
          [providerRequest.sub_category_id],
        );
        if (subCatRows[0]) {
          providerRequest.subCategory = {
            ...subCatRows[0],
            category: {
              id: subCatRows[0].categoryId,
              name: subCatRows[0].categoryName,
              image: subCatRows[0].categoryImage,
            },
          };
        }
      }

      // 2. Resolve additional subcategories for servicesOffered
      if (providerRequest.services_offered) {
        const services = Array.isArray(providerRequest.services_offered)
          ? providerRequest.services_offered
          : [];

        const subCategoryIds = services
          .map((s) => parseInt(s.subCategoryId))
          .filter((id) => !isNaN(id));

        if (subCategoryIds.length > 0) {
          const placeholders = subCategoryIds.map(() => "?").join(",");
          const [subCategories] = await db.query(
            `SELECT sc.*, c.name AS categoryName
             FROM sub_categories sc
             LEFT JOIN categories c ON sc.category_id = c.id
             WHERE sc.id IN (${placeholders})`,
            subCategoryIds,
          );

          providerRequest.servicesOffered = services.map((s) => {
            const subCat = subCategories.find(
              (sc) => sc.id === parseInt(s.subCategoryId),
            );
            return {
              ...s,
              subCategoryName: subCat?.name || "Unknown Service",
              categoryName: subCat?.categoryName || "Other",
            };
          });
        }
      }
    }

    // 3. Fetch Reviews and Calculate Rating
    const [reviews] = await db.query(
      `SELECT r.rating, r.comment, r.created_at AS createdAt,
              seeker.name AS seekerName, seeker.image AS seekerImage,
              s.title AS serviceTitle
       FROM reviews r
       JOIN bookings b ON r.booking_id = b.id
       LEFT JOIN users seeker ON b.seeker_id = seeker.id
       LEFT JOIN services s ON b.service_id = s.id
       WHERE b.provider_id = ?
       ORDER BY r.created_at DESC`,
      [user.id],
    );

    // Reshape reviews to match Prisma format
    const formattedReviews = reviews.map((r) => ({
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      booking: {
        seeker: {
          name: r.seekerName,
          image: r.seekerImage,
        },
        service: {
          title: r.serviceTitle,
        },
      },
    }));

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating =
      reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    // Sanitize data for public view
    const publicUser = {
      name: user.name,
      image: user.image,
      role: user.role,
      email: user.email,
      mobile: user.mobile,
      isProviderAtFirst: user.isProviderAtFirst,
      slug: user.slug,
    };

    return NextResponse.json(
      {
        user: publicUser,
        profile: seekerProfile,
        providerRequest: providerRequest,
        reviews: formattedReviews,
        averageRating: parseFloat(averageRating),
        totalReviews: reviews.length,
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
