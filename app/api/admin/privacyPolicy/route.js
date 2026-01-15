import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/* ================= GET PRIVACY POLICY ================= */
export async function GET() {
  try {
    const policy = await prisma.privacyPolicy.findUnique({
      where: { id: 1 },
    });

    return NextResponse.json(policy || {});
  } catch (error) {
    console.error("GET Privacy Policy Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch privacy policy", details: error.message },
      { status: 500 }
    );
  }
}

/* ================= CREATE / UPDATE PRIVACY POLICY ================= */
export async function POST(req) {
  try {
    const { content } = await req.json();

    const policy = await prisma.privacyPolicy.upsert({
      where: { id: 1 },
      update: { content },
      create: {
        id: 1,
        content,
      },
    });

    return NextResponse.json(policy);
  } catch (error) {
    console.error("POST Privacy Policy Error:", error);
    return NextResponse.json(
      { error: "Failed to save privacy policy", details: error.message },
      { status: 500 }
    );
  }
}
