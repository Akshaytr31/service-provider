// import { db } from "@/lib/db";
// import { getToken } from "next-auth/jwt";
// import { NextResponse } from "next/server";

// export async function POST(req) {
//   const token = await getToken({ req });

//   if (!token?.email) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   const { role } = await req.json();

//   if (!["seeker", "provider"].includes(role)) {
//     return NextResponse.json({ message: "Invalid role" }, { status: 400 });
//   }

//   await db.query(
//     "UPDATE users SET role = ?, isProviderAtFirst = ? WHERE email = ?",
//     [role, role === "provider", token.email]
//   );

//   return NextResponse.json({ message: "Role updated" });
// }


import { db } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function POST(req) {
  const token = await getToken({ req });

  if (!token?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { role } = await req.json();

  if (!["seeker", "provider"].includes(role)) {
    return NextResponse.json({ message: "Invalid role" }, { status: 400 });
  }

  await db.query(
    "UPDATE users SET role = ? WHERE email = ?",
    [role, token.email]
  );

  return NextResponse.json({ message: "Role updated" });
}


