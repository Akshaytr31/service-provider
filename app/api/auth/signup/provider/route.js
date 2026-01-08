import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { generateOTP } from "@/lib/otp";
import { transporter } from "@/lib/mailer";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      // Account Info
      firstName, lastName, email, mobile, password,
      
      // Personal / Business
      businessName, businessType, registrationNumber, establishmentYear, companyLogo,
      gender, dateOfBirth, profilePhoto,

      // Contact
      country, state, city, zipCode, address, serviceRadius, serviceAreas,

      // Service
      categoryId, subCategoryId, servicesOffered, description, yearsExperience,

      // Education & Certs
      qualifications, licenses,

      // Availability
      availability,

      // Pricing
      pricingType, baseRate, onSiteCharges, paymentMethods,

      // Identity
      idType, idNumber, idProofUrl, backgroundCheckConsent,

      // Legal
      termsAccepted, privacyAccepted, rulesAccepted
    } = body;

    // Basic Validation
    if (!email || !password || !firstName || !lastName || !mobile) {
      return NextResponse.json({ message: "Missing required account fields" }, { status: 400 });
    }

    // Check existing user
    const [existingUsers] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = `${firstName} ${lastName}`.trim();

    // Start Transaction (simulate by running queries sequentially, revert on failure manually if needed, or rely on clean data)
    // MySQL2 doesn't support easy transactions without connection management, so we'll do sequential inserts.

    // 1. Create User
    const [userResult] = await db.query(
      `INSERT INTO users (
        firstName, lastName, name, email, mobile, password, 
        role, providerRequestStatus, isProviderAtFirst, email_verified
       ) VALUES (?, ?, ?, ?, ?, ?, 'provider', 'PENDING', true, false)`,
      [firstName, lastName, fullName, email, mobile, hashedPassword]
    );

    const userId = userResult.insertId;

    // 2. Create Provider Request (The Big One)
    await db.query(
      `INSERT INTO provider_requests (
        user_id, business_name, business_type, registration_number, establishment_year, company_logo,
        gender, date_of_birth, profile_photo,
        country, state, city, zip_code, address, service_radius, service_areas,
        sub_category_id, services_offered, description, years_experience,
        qualifications, licenses, availability,
        pricing_type, base_rate, on_site_charges, payment_methods,
        id_type, id_number, id_proof_url, background_check_consent,
        contact_method,
        terms_accepted, privacy_accepted, rules_accepted,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Email', ?, ?, ?, 'PENDING')`,
      [
        userId, businessName || null, businessType || null, registrationNumber || null, establishmentYear || null, companyLogo || null,
        gender || null, dateOfBirth || null, profilePhoto || null,
        country || null, state || null, city || null, zipCode || null, address || null, serviceRadius || null, JSON.stringify(serviceAreas || []),
        subCategoryId ? parseInt(subCategoryId) : null, JSON.stringify(servicesOffered || []), description || null, yearsExperience || null,
        JSON.stringify(qualifications || []), JSON.stringify(licenses || []), JSON.stringify(availability || {}),
        pricingType || null, baseRate || null, onSiteCharges || null, JSON.stringify(paymentMethods || []),
        idType || null, idNumber || null, idProofUrl || null, backgroundCheckConsent ? 1 : 0,
        termsAccepted ? 1 : 0, privacyAccepted ? 1 : 0, rulesAccepted ? 1 : 0
      ]
    );

    // 3. Generate & Send OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await db.query(
      "INSERT INTO email_otps (email, otp, expires_at) VALUES (?, ?, ?)",
      [email, otp, expiresAt]
    );

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Verify your email - Provider Signup",
            text: `Welcome to the platform! Your verification code is ${otp}`,
        });
    } catch (emailErr) {
        console.error("Failed to send email:", emailErr);
        // Don't fail the request, allowing user to resend later
    }

    return NextResponse.json({ message: "Account created", userId });

  } catch (err) {
    console.error("Provider Signup Error:", err);
    return NextResponse.json({ message: "Internal server error", error: err.message }, { status: 500 });
  }
}
