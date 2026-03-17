import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { generateUniqueSlugDb } from "@/lib/slug";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1. Get User
    const [userRows] = await db.query("SELECT * FROM users WHERE email = ?", [
      session.user.email,
    ]);

    if (userRows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = userRows[0];

    // 2. Get Seeker Profile
    const [profileRows] = await db.query(
      "SELECT * FROM SeekerProfile WHERE userId = ?",
      [user.id],
    );

    // 3. Get Latest Provider Request
    const [requestRows] = await db.query(
      "SELECT * FROM provider_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [user.id],
    );

    // 4. Auto-generate slug if missing
    if (!user.slug) {
      const nameSource = requestRows?.[0]?.business_name || user.name || "user";
      const newSlug = await generateUniqueSlugDb(nameSource, "users");

      if (newSlug) {
        await db.query("UPDATE users SET slug = ? WHERE id = ?", [
          newSlug,
          user.id,
        ]);
        user.slug = newSlug;
      }
    }

    const userData = {
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      dateOfBirth: user.dateOfBirth,
      image: user.image,
      isProviderAtFirst: user.isProviderAtFirst,
      slug: user.slug,
    };

    return NextResponse.json(
      {
        user: userData,
        profile: profileRows[0] || null,
        providerRequest: requestRows[0] || null,
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
  let connection;
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
      slug,
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
      image,
    } = body;

    const userEmail = session.user.email;

    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. Get User
    const [userRows] = await connection.query(
      "SELECT id, role, slug FROM users WHERE email = ?",
      [userEmail],
    );

    if (userRows.length === 0) throw new Error("User not found");
    const user = userRows[0];

    // 2. Update User Role if needed (Transition from 'none' -> 'seeker')
    if (user.role === "none" || user.role === "new_user") {
      await connection.query(
        "UPDATE users SET role = 'seeker' WHERE email = ?",
        [userEmail],
      );
    }

    // 2.5 Update/Generate Slug
    let newSlug = slug;
    if (!newSlug && !user.slug) {
      const nameSource =
        firstName && lastName
          ? `${firstName} ${lastName}`
          : businessName || "user";
      newSlug = await generateUniqueSlugDb(nameSource, "users");
    } else if (newSlug && newSlug !== user.slug) {
      newSlug = await generateUniqueSlugDb(newSlug, "users", user.slug);
    }

    if (newSlug && newSlug !== user.slug) {
      await connection.query("UPDATE users SET slug = ? WHERE email = ?", [
        newSlug,
        userEmail,
      ]);
    }

    // 2.6 Update Image if provided
    if (image) {
      await connection.query("UPDATE users SET image = ? WHERE email = ?", [
        image,
        userEmail,
      ]);
    }

    // 3. Prepare Profile Data
    const qualifications = education ? JSON.stringify([education]) : null;

    // 4. Upsert Seeker Profile
    const [existingProfiles] = await connection.query(
      "SELECT id FROM SeekerProfile WHERE userId = ?",
      [user.id],
    );

    if (existingProfiles.length > 0) {
      // UPDATE
      await connection.query(
        `UPDATE SeekerProfile SET 
          userType = ?, gender = ?, address = ?, city = ?, zipCode = ?, state = ?, country = ?, 
          acceptedTermsandconditions = ?, firstName = ?, lastName = ?, idType = ?, idNumber = ?, 
          backgroundCheck = ?, qualifications = ?, fieldOfStudy = ?, institution = ?, year = ?,
          businessName = ?, businessType = ?, registrationNumber = ?, establishmentYear = ?, trnNumber = ?, businessExpiryDate = ?
        WHERE userId = ?`,
        [
          userType,
          gender || null,
          address || null,
          city || null,
          zipCode || null,
          state || null,
          country || null,
          acceptedTermsandconditions || false,
          userType === "individual" ? firstName : null,
          userType === "individual" ? lastName : null,
          userType === "individual" ? idType : null,
          userType === "individual" ? idNumber : null,
          userType === "individual" ? backgroundCheckConsent || false : false,
          qualifications,
          userType === "individual" ? education?.field || null : null,
          userType === "individual" ? education?.institution || null : null,
          userType === "individual" ? education?.year || null : null,
          userType === "business" ? businessName : null,
          userType === "business" ? businessType : null,
          userType === "business" ? registrationNumber : null,
          userType === "business" ? establishmentYear : null,
          userType === "business" ? trnNumber : null,
          userType === "business" ? businessExpiryDate : null,
          user.id,
        ],
      );
    } else {
      // INSERT
      await connection.query(
        `INSERT INTO SeekerProfile (
          userId, userType, gender, address, city, zipCode, state, country, 
          acceptedTermsandconditions, firstName, lastName, idType, idNumber, 
          backgroundCheck, qualifications, fieldOfStudy, institution, year,
          businessName, businessType, registrationNumber, establishmentYear, trnNumber, businessExpiryDate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          userType,
          gender || null,
          address || null,
          city || null,
          zipCode || null,
          state || null,
          country || null,
          acceptedTermsandconditions || false,
          userType === "individual" ? firstName : null,
          userType === "individual" ? lastName : null,
          userType === "individual" ? idType : null,
          userType === "individual" ? idNumber : null,
          userType === "individual" ? backgroundCheckConsent || false : false,
          qualifications,
          userType === "individual" ? education?.field || null : null,
          userType === "individual" ? education?.institution || null : null,
          userType === "individual" ? education?.year || null : null,
          userType === "business" ? businessName : null,
          userType === "business" ? businessType : null,
          userType === "business" ? registrationNumber : null,
          userType === "business" ? establishmentYear : null,
          userType === "business" ? trnNumber : null,
          userType === "business" ? businessExpiryDate : null,
        ],
      );
    }

    await connection.commit();

    return NextResponse.json(
      { message: "Profile updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error updating seeker profile:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
