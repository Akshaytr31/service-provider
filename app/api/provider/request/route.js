import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { generateUniqueSlugDb } from "@/lib/slug";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find existing user
    const [userRows] = await db.query("SELECT * FROM users WHERE email = ?", [
      session.user.email,
    ]);
    let user = userRows[0];

    if (!user) {
      const [result] = await db.query(
        "INSERT INTO users (email, name, role, createdAt) VALUES (?, ?, 'seeker', NOW())",
        [session.user.email, session.user.name || "User"],
      );
      const [newUserRows] = await db.query("SELECT * FROM users WHERE id = ?", [
        result.insertId,
      ]);
      user = newUserRows[0];
    }

    const body = await req.json();

    const [result] = await db.query(
      `INSERT INTO provider_requests (user_id, status, created_at, profile_photo)
       VALUES (?, 'PENDING', NOW(), ?)`,
      [user.id, body.profilePhoto || null],
    );

    const [requestRows] = await db.query(
      "SELECT * FROM provider_requests WHERE id = ?",
      [result.insertId],
    );

    return NextResponse.json(requestRows[0], { status: 201 });
  } catch (error) {
    console.error("PROVIDER REQUEST ERROR:", error);
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

    // Find user with latest provider request
    const [userRows] = await db.query("SELECT * FROM users WHERE email = ?", [
      session.user.email,
    ]);
    const user = userRows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [requestRows] = await db.query(
      "SELECT * FROM provider_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [user.id],
    );

    if (!requestRows[0]) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const providerRequestId = requestRows[0].id;

    // Build dynamic update
    const updateFields = [];
    const updateValues = [];

    const fieldMap = {
      profilePhoto: "profile_photo",
      bannerPhoto: "banner_photo",
      firstName: "first_name",
      lastName: "last_name",
      businessName: "business_name",
      businessType: "business_type",
      registrationNumber: "registration_number",
      trnNumber: "trn_number",
      establishmentYear: "establishment_year",
      businessExpiryDate: "business_expiry_date",
      description: "description",
      yearsExperience: "years_experience",
      pricingType: "pricing_type",
      baseRate: "base_rate",
      onSiteCharges: "on_site_charges",
      address: "address",
      city: "city",
      state: "state",
      country: "country",
      zipCode: "zip_code",
      idType: "id_type",
      idNumber: "id_number",
    };

    for (const [jsKey, dbCol] of Object.entries(fieldMap)) {
      if (body[jsKey] !== undefined) {
        updateFields.push(`${dbCol} = ?`);
        updateValues.push(body[jsKey]);
      }
    }

    // Numeric fields
    if (body.serviceRadius !== undefined) {
      updateFields.push("service_radius = ?");
      updateValues.push(parseInt(body.serviceRadius) || null);
    }
    if (body.categoryId !== undefined) {
      updateFields.push("category_id = ?");
      updateValues.push(parseInt(body.categoryId) || null);
    }
    if (body.subCategoryId !== undefined) {
      updateFields.push("sub_category_id = ?");
      updateValues.push(parseInt(body.subCategoryId) || null);
    }
    if (body.latitude !== undefined) {
      updateFields.push("latitude = ?");
      updateValues.push(body.latitude);
    }
    if (body.longitude !== undefined) {
      updateFields.push("longitude = ?");
      updateValues.push(body.longitude);
    }

    // JSON fields
    const jsonFields = {
      licenses: "licenses",
      servicesOffered: "services_offered",
      gallery: "gallery",
      availability: "availability",
      qualifications: "qualifications",
    };

    for (const [jsKey, dbCol] of Object.entries(jsonFields)) {
      if (body[jsKey] !== undefined) {
        updateFields.push(`${dbCol} = ?`);
        updateValues.push(JSON.stringify(body[jsKey]));
      }
    }

    if (updateFields.length > 0) {
      updateValues.push(providerRequestId);
      await db.query(
        `UPDATE provider_requests SET ${updateFields.join(", ")} WHERE id = ?`,
        updateValues,
      );
    }

    // Fetch updated request
    const [updatedRows] = await db.query(
      "SELECT * FROM provider_requests WHERE id = ?",
      [providerRequestId],
    );
    const updatedRequest = updatedRows[0];

    // Parse JSON columns
    const jsonCols = [
      "licenses",
      "qualifications",
      "availability",
      "services_offered",
      "gallery",
    ];
    for (const col of jsonCols) {
      if (updatedRequest[col] && typeof updatedRequest[col] === "string") {
        try {
          updatedRequest[col] = JSON.parse(updatedRequest[col]);
        } catch {}
      }
    }

    // Generate and update slug if name/business name changes
    const nameSource =
      updatedRequest.business_name ||
      `${updatedRequest.first_name || ""} ${updatedRequest.last_name || ""}`.trim() ||
      user.name;

    if (nameSource) {
      const newSlug = await generateUniqueSlugDb(
        nameSource,
        "users",
        user.slug,
      );

      if (newSlug && newSlug !== user.slug) {
        await db.query("UPDATE users SET slug = ? WHERE id = ?", [
          newSlug,
          user.id,
        ]);
      }
    }

    return NextResponse.json(updatedRequest, { status: 200 });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update request", message: error.message },
      { status: 500 },
    );
  }
}
