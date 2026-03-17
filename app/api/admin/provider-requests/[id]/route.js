import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { transporter } from "@/lib/mailer";

// Helper to parse JSON columns on a provider request row
function parseJsonCols(row) {
  if (!row) return row;
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
    if (row[col] && typeof row[col] === "string") {
      try {
        row[col] = JSON.parse(row[col]);
      } catch {}
    }
  }
  return row;
}

/* ================= GET SINGLE REQUEST ================= */
export async function GET(req, context) {
  try {
    const { id } = await context.params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Invalid request id" },
        { status: 400 },
      );
    }

    // Fetch request with user info
    const [requestRows] = await db.query(
      `SELECT pr.*, u.id AS userId, u.email AS userEmail, u.name AS userName
       FROM provider_requests pr
       LEFT JOIN users u ON pr.user_id = u.id
       WHERE pr.id = ?`,
      [Number(id)],
    );

    if (!requestRows[0]) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const request = parseJsonCols(requestRows[0]);
    request.user = {
      id: request.userId,
      email: request.userEmail,
      name: request.userName,
    };

    // Fetch clarifications
    const [clarifications] = await db.query(
      "SELECT * FROM clarifications WHERE provider_request_id = ? ORDER BY created_at ASC",
      [Number(id)],
    );
    request.clarifications = clarifications;

    // AUTO-EXPIRE CHECK
    let hasUpdates = false;
    const now = new Date();

    if (Array.isArray(request.licenses)) {
      for (const license of request.licenses) {
        if (
          license.expiry &&
          new Date(license.expiry) < now &&
          license.status !== "EXPIRED"
        ) {
          license.status = "EXPIRED";
          hasUpdates = true;

          if (request.user?.email) {
            try {
              await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: request.user.email,
                subject: `Action Required: License Expired (${license.name || "Document"})`,
                html: `
                    <p>Dear ${request.user.name || "User"},</p>
                    <p>Your license <strong>${license.name} (Version ${license.version || 1})</strong> has expired.</p>
                    <p>Please log in to your profile and upload the latest version immediately.</p>
                `,
              });
            } catch (e) {
              console.error("Failed to send expiry email", e);
            }
          }
        }
      }

      if (hasUpdates) {
        await db.query(
          "UPDATE provider_requests SET licenses = ? WHERE id = ?",
          [JSON.stringify(request.licenses), Number(id)],
        );
      }
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error("GET REQUEST ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch request" },
      { status: 500 },
    );
  }
}

/* ================= APPROVE / REJECT ================= */
export async function PATCH(req, context) {
  try {
    const { id } = await context.params;
    const { action, reason, licenseIndex } = await req.json();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Invalid request id" },
        { status: 400 },
      );
    }

    if (
      ![
        "approve",
        "reject",
        "clarify",
        "expire_license",
        "approve_license",
        "reject_license",
      ].includes(action)
    ) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Helper to fetch request with user
    async function fetchRequestWithUser() {
      const [rows] = await db.query(
        `SELECT pr.*, u.id AS userId, u.email AS userEmail, u.name AS userName
         FROM provider_requests pr
         LEFT JOIN users u ON pr.user_id = u.id
         WHERE pr.id = ?`,
        [Number(id)],
      );
      if (!rows[0]) return null;
      const r = parseJsonCols(rows[0]);
      r.user = { id: r.userId, email: r.userEmail, name: r.userName };
      return r;
    }

    // HANDLE LICENSE EXPIRATION
    if (action === "expire_license") {
      const request = await fetchRequestWithUser();
      if (!request) {
        return NextResponse.json(
          { error: "Request not found" },
          { status: 404 },
        );
      }

      const licenses = Array.isArray(request.licenses) ? request.licenses : [];
      if (typeof licenseIndex !== "number" || !licenses[licenseIndex]) {
        return NextResponse.json(
          { error: "Invalid license index" },
          { status: 400 },
        );
      }

      const licenseName = licenses[licenseIndex].name || "License";
      const licenseVersion = licenses[licenseIndex].version || 1;
      licenses[licenseIndex].status = "EXPIRED";

      await db.query("UPDATE provider_requests SET licenses = ? WHERE id = ?", [
        JSON.stringify(licenses),
        Number(id),
      ]);

      if (request.user?.email) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: request.user.email,
          subject: `Action Required: License Expired (${licenseName})`,
          html: `
            <p>Dear ${request.user.name || "User"},</p>
            <p>Your license <strong>${licenseName} (Version ${licenseVersion})</strong> has been marked as <strong>EXPIRED</strong> by the admin.</p>
            <p>Please log in to your profile and upload the latest version of this document immediately to avoid service disruption.</p>
          `,
        });
      }

      await updateServiceStatusForProvider(request.user?.email);

      return NextResponse.json({
        success: true,
        message: "License marked as expired",
      });
    }

    // HANDLE LICENSE APPROVAL
    if (action === "approve_license") {
      const request = await fetchRequestWithUser();
      if (!request) {
        return NextResponse.json(
          { error: "Request not found" },
          { status: 404 },
        );
      }

      const licenses = Array.isArray(request.licenses) ? request.licenses : [];
      if (typeof licenseIndex !== "number" || !licenses[licenseIndex]) {
        return NextResponse.json(
          { error: "Invalid license index" },
          { status: 400 },
        );
      }

      const licenseName = licenses[licenseIndex].name || "License";
      const licenseVersion = licenses[licenseIndex].version || 1;
      licenses[licenseIndex].status = "APPROVED";

      await db.query("UPDATE provider_requests SET licenses = ? WHERE id = ?", [
        JSON.stringify(licenses),
        Number(id),
      ]);

      if (request.user?.email) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: request.user.email,
            subject: `License Approved: ${licenseName}`,
            html: `
                <p>Dear ${request.user.name || "User"},</p>
                <p>Your license <strong>${licenseName} (Version ${licenseVersion})</strong> has been <strong>APPROVED</strong> by the admin.</p>
                <p>Thank you for keeping your documentation up to date.</p>
            `,
          });
        } catch (e) {
          console.error("Failed to send approval email", e);
        }
      }

      await updateServiceStatusForProvider(request.user?.email);

      return NextResponse.json({
        success: true,
        message: "License approved",
      });
    }

    // HANDLE LICENSE REJECTION
    if (action === "reject_license") {
      const request = await fetchRequestWithUser();
      if (!request) {
        return NextResponse.json(
          { error: "Request not found" },
          { status: 404 },
        );
      }

      const licenses = Array.isArray(request.licenses) ? request.licenses : [];
      if (typeof licenseIndex !== "number" || !licenses[licenseIndex]) {
        return NextResponse.json(
          { error: "Invalid license index" },
          { status: 400 },
        );
      }

      const licenseName = licenses[licenseIndex].name || "License";
      const licenseVersion = licenses[licenseIndex].version || 1;
      licenses[licenseIndex].status = "REJECTED";

      await db.query("UPDATE provider_requests SET licenses = ? WHERE id = ?", [
        JSON.stringify(licenses),
        Number(id),
      ]);

      if (request.user?.email) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: request.user.email,
            subject: `Action Required: License Rejected (${licenseName})`,
            html: `
                <p>Dear ${request.user.name || "User"},</p>
                <p>Your license <strong>${licenseName} (Version ${licenseVersion})</strong> has been <strong>REJECTED</strong> by the admin.</p>
                <p>Please log in to your profile to upload a valid document.</p>
            `,
          });
        } catch (e) {
          console.error("Failed to send rejection email", e);
        }
      }

      return NextResponse.json({
        success: true,
        message: "License rejected",
      });
    }

    // HANDLE CLARIFICATION (No status change)
    if (action === "clarify") {
      const request = await fetchRequestWithUser();
      if (!request) {
        return NextResponse.json(
          { error: "Request not found" },
          { status: 404 },
        );
      }

      if (request.user?.email) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: request.user.email,
          subject: "Clarification Needed for Provider Request",
          html: `
            <p>Dear ${request.user.name || "User"},</p>
            <p>We reviewed your provider request and need some clarification.</p>
            <p><strong>Message from Admin:</strong></p>
            <blockquote style="border-left: 4px solid #ccc; padding-left: 10px; color: #555;">
              ${reason}
            </blockquote>
            <p>Please check your details and update necessary information.</p>
          `,
        });
      }

      // SAVE CLARIFICATION TO DB
      await db.query(
        "INSERT INTO clarifications (provider_request_id, message, sender, created_at) VALUES (?, ?, 'ADMIN', NOW())",
        [request.id, reason],
      );

      return NextResponse.json({
        success: true,
        message: "Clarification sent",
      });
    }

    // HANDLE APPROVE / REJECT
    const status = action === "approve" ? "APPROVED" : "REJECTED";

    const updateFields = ["status = ?"];
    const updateValues = [status];

    if (action === "reject") {
      updateFields.push("rejection_reason = ?");
      updateValues.push(reason);
    }

    updateValues.push(Number(id));

    await db.query(
      `UPDATE provider_requests SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues,
    );

    // Fetch the updated request with user info
    const request = await fetchRequestWithUser();

    // Update user role
    if (action === "approve") {
      await db.query(
        "UPDATE users SET role = 'provider', providerRequestStatus = 'approved' WHERE id = ?",
        [request.user_id],
      );
    } else {
      await db.query(
        "UPDATE users SET providerRequestStatus = 'rejected' WHERE id = ?",
        [request.user_id],
      );
    }

    // Send Email
    if (request.user?.email) {
      if (action === "reject") {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: request.user.email,
          subject: "Provider Request Update",
          html: `
              <p>Dear ${request.user.name || "User"},</p>
              <p>Your request to become a provider has been <strong>rejected</strong>.</p>
              <p><strong>Reason:</strong> ${reason || "Not specified"}</p>
              <p>You can view details and reapply by visiting your dashboard:</p>
            `,
        });
      } else if (action === "approve") {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: request.user.email,
          subject: "Provider Request Approved!",
          html: `
              <p>Dear ${request.user.name || "User"},</p>
              <p>Congratulations! Your request to become a provider has been <strong>APPROVED</strong>.</p>
              <p>You can now access your provider dashboard to post services.</p>
            `,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update request" },
      { status: 500 },
    );
  }
}

// HELPER TO UPDATE STATUS INSTANTLY
async function updateServiceStatusForProvider(email) {
  if (!email) return;

  // 1. Get Provider Request
  const [providerRows] = await db.query(
    `SELECT pr.* FROM provider_requests pr
     JOIN users u ON pr.user_id = u.id
     WHERE u.email = ? ORDER BY pr.created_at DESC LIMIT 1`,
    [email],
  );

  const provider = providerRows[0];
  if (!provider) return;

  // Parse licenses
  let licenses = provider.licenses;
  if (typeof licenses === "string") {
    try {
      licenses = JSON.parse(licenses);
    } catch {
      return;
    }
  }
  if (!Array.isArray(licenses)) return;

  const today = new Date();

  // Track VALID subcategories
  const validSubCategoryIds = new Set();
  const linkedSubCategoryIds = new Set();

  for (const lic of licenses) {
    if (!lic.subCategoryId) continue;
    const subId = String(lic.subCategoryId);
    linkedSubCategoryIds.add(subId);

    const expiryDate = new Date(lic.expiry);
    if (expiryDate > today && lic.status === "APPROVED") {
      validSubCategoryIds.add(subId);
    }
  }

  // 2. Get Services
  const [services] = await db.query(
    "SELECT * FROM services WHERE providerEmail = ?",
    [email],
  );

  for (const service of services) {
    const subId = String(service.sub_category_id);

    if (linkedSubCategoryIds.has(subId)) {
      if (!validSubCategoryIds.has(subId)) {
        if (service.status !== "BLOCKED") {
          await db.query(
            "UPDATE services SET status = 'BLOCKED' WHERE id = ?",
            [service.id],
          );
        }
      } else {
        if (service.status === "BLOCKED") {
          await db.query("UPDATE services SET status = 'ACTIVE' WHERE id = ?", [
            service.id,
          ]);
        }
      }
    }
  }
}
