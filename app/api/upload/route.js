import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  // Basic auth check
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const folder = formData.get("folder") || "provider-assets";

  if (!file) {
    return NextResponse.json({ message: "File required" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ message: "Invalid file type" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const upload = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: folder,
            resource_type: "image",
          },
          (err, result) => {
            if (err) {
              console.error("Cloudinary Upload Error:", err);
              reject(err);
            }
            resolve(result);
          },
        )
        .end(buffer);
    });

    return NextResponse.json({
      publicId: upload.public_id,
      format: upload.format,
      resourceType: upload.resource_type,
      version: upload.version,
      secureUrl: upload.secure_url,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Upload failed", error: error.message },
      { status: 500 },
    );
  }
}
