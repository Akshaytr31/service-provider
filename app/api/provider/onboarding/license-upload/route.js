import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

// export async function POST(req) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.email) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

export async function POST(req) {
  // Allow unauthenticated uploads for onboarding
  // In production, consider adding rate limiting or verifying a recently sent OTP.

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ message: "File required" }, { status: 400 });
  }

  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ message: "Invalid file type" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  console.log("Starting Cloudinary upload...");
  const upload = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "provider-licenses",
          resource_type: "auto",
        },
        (err, result) => {
          if (err) {
            console.error("Cloudinary Upload Error:", err);
            reject(err);
          }
          console.log("Cloudinary Upload Success:", result.public_id);
          resolve(result);
        },
      )
      .end(buffer);
  });

  return NextResponse.json({
    publicId: upload.public_id,
    format: upload.format,
    resourceType: upload.resource_type,
  });
}
