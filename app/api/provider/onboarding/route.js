import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

/* ===================================================== */
/* PROVIDER ONBOARDING API                               */
/* ===================================================== */

export async function POST(req) {
  try {
    /* ========== AUTH ========== */
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { step, data } = await req.json();
    const email = session.user.email;

    /* ========== USER ========== */
    const [users] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (!users.length) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userId = users[0].id;

    /* ========== PROVIDER REQUEST (SAFE CREATE) ========== */
    const [existing] = await db.query(
      "SELECT id FROM provider_requests WHERE user_id = ?",
      [userId]
    );

    if (!existing.length) {
      await db.query(
        "INSERT INTO provider_requests (user_id, status, created_at) VALUES (?, 'PENDING', NOW())",
        [userId]
      );
    }

    /* ===================================================== */
    /* STEP 9 — OTP VERIFICATION ONLY                        */
    /* ===================================================== */
    if (step === 9) {
      const { otp } = data;

      if (!otp) {
        return NextResponse.json(
          { message: "OTP is required" },
          { status: 400 }
        );
      }

      const [rows] = await db.query(
        "SELECT otp, expires_at FROM email_otps WHERE email = ? ORDER BY id DESC LIMIT 1",
        [email]
      );

      if (!rows.length) {
        return NextResponse.json({ message: "OTP not found" }, { status: 400 });
      }

      if (rows[0].otp !== otp) {
        return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
      }

      if (new Date(rows[0].expires_at) < new Date()) {
        return NextResponse.json({ message: "OTP expired" }, { status: 400 });
      }

      await db.query(
        "UPDATE users SET email_verified = true WHERE id = ?",
        [userId]
      );

      await db.query("DELETE FROM email_otps WHERE email = ?", [email]);

      return NextResponse.json({
        message: "Onboarding completed successfully",
      });
    }

    /* ===================================================== */
    /* SAVE STEPS 0–8                                       */
    /* ===================================================== */
    await saveStepData(step, data, userId);

    return NextResponse.json({ message: "Step saved successfully" });
  } catch (err) {
    console.error("ONBOARDING ERROR:", err.sqlMessage || err.message);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ===================================================== */
/* SAVE STEP DATA — MATCHES PRISMA SCHEMA                */
/* ===================================================== */

async function saveStepData(step, data, userId) {
  switch (step) {
    case 0:
      return db.query(
        `UPDATE provider_requests
         SET business_name = ?, business_type = ?, registration_number = ?, establishment_year = ?
         WHERE user_id = ?`,
        [
          data.businessName || null,
          data.businessType || null,
          data.registrationNumber || null,
          data.establishmentYear || null,
          userId,
        ]
      );

    case 1:
      return db.query(
        `UPDATE provider_requests
         SET city = ?, zip_code = ?, state = ?, country = ?, address = ?, service_radius = ?, service_areas = ?
         WHERE user_id = ?`,
        [
          data.city,
          data.zipCode,
          data.state,
          data.country,
          data.address,
          data.serviceRadius || null,
          JSON.stringify(data.serviceAreas || []),
          userId,
        ]
      );

    case 2:
      return db.query(
        `UPDATE provider_requests
         SET sub_category_id = ?, services_offered = ?, description = ?, years_experience = ?
         WHERE user_id = ?`,
        [
          data.subCategoryId,
          JSON.stringify(data.servicesOffered || []),
          data.description,
          data.yearsExperience,
          userId,
        ]
      );

    case 3:
      return db.query(
        `UPDATE provider_requests
         SET qualifications = ?
         WHERE user_id = ?`,
        [JSON.stringify(data.qualifications || []), userId]
      );

    case 4:
      return db.query(
        `UPDATE provider_requests
         SET licenses = ?
         WHERE user_id = ?`,
        [JSON.stringify(data.licenses || []), userId]
      );

    case 5:
      return db.query(
        `UPDATE provider_requests
         SET availability = ?
         WHERE user_id = ?`,
        [JSON.stringify(data.availability), userId]
      );

    case 6:
      return db.query(
        `UPDATE provider_requests
         SET pricing_type = ?, base_rate = ?, on_site_charges = ?, payment_methods = ?
         WHERE user_id = ?`,
        [
          data.pricingType,
          data.baseRate,
          data.onSiteCharges,
          JSON.stringify(data.paymentMethods || []),
          userId,
        ]
      );

    case 7:
      return db.query(
        `UPDATE provider_requests
         SET id_type = ?, id_number = ?, background_check_consent = ?
         WHERE user_id = ?`,
        [
          data.idType,
          data.idNumber,
          data.backgroundCheckConsent || false,
          userId,
        ]
      );

    case 8:
      return db.query(
        `UPDATE provider_requests
         SET terms_accepted = ?, privacy_accepted = ?, rules_accepted = ?
         WHERE user_id = ?`,
        [
          data.termsAccepted,
          data.privacyAccepted,
          data.rulesAccepted,
          userId,
        ]
      );

    default:
      return;
  }
}
