import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  let connection;
  let body = {};
  try {
    body = await req.json();
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

    // 1. Basic Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    // 2. Check overlap
    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: "User already exists with this email" },
        { status: 409 },
      );
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Verify OTP
    if (!otp) {
      return NextResponse.json({ message: "OTP is required" }, { status: 400 });
    }

    const [otpRows] = await db.query(
      "SELECT * FROM email_otps WHERE email = ? ORDER BY created_at DESC LIMIT 1",
      [email],
    );

    const otpRecord = otpRows[0];

    if (!otpRecord || otpRecord.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    if (new Date() > new Date(otpRecord.expires_at)) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    // 5. Transaction: Create User + Provider Request
    connection = await db.getConnection();
    await connection.beginTransaction();

    const displayName =
      userType === "individual" ? `${firstName} ${lastName}` : businessName;

    // Create User
    const [userResult] = await connection.query(
      `INSERT INTO users (email, password, role, name, providerRequestStatus, isProviderAtFirst, email_verified) 
       VALUES (?, ?, 'provider', ?, 'PENDING', true, true)`,
      [email, hashedPassword, displayName],
    );

    const userId = userResult.insertId;

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

    await connection.commit();

    // 6. Delete Used OTP
    await db.query("DELETE FROM email_otps WHERE id = ?", [otpRecord.id]);

    return NextResponse.json(
      { message: "Provider account created successfully" },
      { status: 201 },
    );
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Provider Signup Error:", error);
    console.error("Request Body was:", JSON.stringify(body, null, 2));
    return NextResponse.json(
      { message: `Error: ${error.message}` },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
