import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  let connection;
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
      latitude,
      longitude,
      // Service details (Multiple support)
      services,
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

    // Basic Validation
    if (!userType || !termsAccepted) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const userId = session.user.id;

    // Check if request already exists
    const [existingRequests] = await db.query(
      "SELECT id, status FROM provider_requests WHERE user_id = ? AND status = 'PENDING'",
      [userId],
    );

    if (existingRequests.length > 0) {
      return NextResponse.json(
        { message: "You already have a pending provider request." },
        { status: 409 },
      );
    }

    // Transaction: Create Request + Update User
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Create Provider Request
    await connection.query(
      `INSERT INTO provider_requests (
        user_id, user_type, first_name, last_name, business_name, business_type, 
        registration_number, trn_number, business_expiry_date, establishment_year,
        city, zip_code, state, country, address, service_radius, service_areas,
        latitude, longitude, category_id, sub_category_id, services_offered,
        description, years_experience, qualifications, licenses, availability,
        pricing_type, base_rate, on_site_charges, payment_methods,
        id_type, id_number, background_check_consent, terms_accepted, privacy_accepted,
        rules_accepted, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [
        userId,
        userType,
        firstName || null,
        lastName || null,
        businessName || null,
        businessType || null,
        registrationNumber || null,
        trnNumber || null,
        expiryDate || null,
        establishmentYear || null,
        city || null,
        zipCode || null,
        state || null,
        country || null,
        address || null,
        serviceRadius ? parseInt(serviceRadius) : null,
        JSON.stringify(serviceAreas || []),
        latitude || null,
        longitude || null,
        services?.[0]?.categoryId ? parseInt(services[0].categoryId) : null,
        services?.[0]?.subCategoryId
          ? parseInt(services[0].subCategoryId)
          : null,
        JSON.stringify(services || []),
        services?.[0]?.description || "",
        yearsExperience || null,
        JSON.stringify(qualifications || []),
        JSON.stringify(licenses || []),
        JSON.stringify(availability || {}),
        pricingType || null,
        baseRate || null,
        onSiteCharges || null,
        JSON.stringify(paymentMethods || []),
        idType || null,
        idNumber || null,
        backgroundCheckConsent || false,
        termsAccepted || false,
        privacyAccepted || false,
        rulesAccepted || false,
      ],
    );

    // Update User Status
    const [userRows] = await connection.query(
      "SELECT role FROM users WHERE id = ?",
      [userId],
    );

    if (userRows.length > 0) {
      const user = userRows[0];
      if (user.role === "none" || user.role === "new_user") {
        await connection.query(
          "UPDATE users SET role = 'provider', isProviderAtFirst = true, providerRequestStatus = 'PENDING' WHERE id = ?",
          [userId],
        );
      } else {
        await connection.query(
          "UPDATE users SET providerRequestStatus = 'PENDING' WHERE id = ?",
          [userId],
        );
      }
    }

    await connection.commit();

    return NextResponse.json(
      { message: "Provider request submitted successfully" },
      { status: 201 },
    );
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Provider Upgrade Error:", error);
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
