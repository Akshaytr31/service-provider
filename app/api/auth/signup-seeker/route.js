import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  let connection;
  try {
    const body = await req.json();
    console.log("Signup Payload Received:", JSON.stringify(body, null, 2));

    const {
      email,
      password,
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

      // Education
      education,

      // Common
      gender,
      address,
      city,
      zipCode,
      state,
      country,
      acceptedTermsandconditions,
    } = body;

    /* ================= BASIC VALIDATION ================= */

    if (!email || !password || !userType) {
      return NextResponse.json(
        { message: "Invalid signup payload" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    /* ================= TRANSACTION ================= */
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 0️⃣ Construct Display Name
    let displayName = "";
    if (userType === "business") {
      displayName = businessName;
    } else {
      displayName = `${firstName} ${lastName}`;
    }

    // 1️⃣ Create user
    const [userResult] = await connection.query(
      `INSERT INTO users (email, password, role, email_verified, name) 
       VALUES (?, ?, 'seeker', true, ?)`,
      [email, hashedPassword, displayName],
    );

    const userId = userResult.insertId;
    console.log("User created with ID:", userId);

    // 2️⃣ Construct profile data
    const qualifications = education ? JSON.stringify([education]) : null;

    // 3️⃣ Create seeker profile
    await connection.query(
      `INSERT INTO SeekerProfile (
        userId, userType, gender, address, city, zipCode, state, country, 
        acceptedTermsandconditions, firstName, lastName, idType, idNumber, 
        backgroundCheck, qualifications, fieldOfStudy, institution, year,
        businessName, businessType, registrationNumber, establishmentYear, trnNumber, businessExpiryDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
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

    await connection.commit();

    return NextResponse.json(
      { message: "Seeker account created successfully" },
      { status: 201 },
    );
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Signup error details:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
