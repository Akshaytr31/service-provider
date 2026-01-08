// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { db } from "@/lib/db";
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";


// /**
//  * GET → fetch all pending provider requests
//  */
// export async function GET() {
//   const session = await getServerSession(authOptions);

//   if (session?.user?.role !== "admin") {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   const [rows] = await db.query(
//     "SELECT name, email FROM users WHERE providerRequestStatus = 'pending'"
//   );

//   return NextResponse.json(rows);
// }

// /**
//  * POST → approve or reject provider request
//  */
// export async function POST(req) {
//   const session = await getServerSession(authOptions);

//   if (session?.user?.role !== "admin") {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   const { email, action } = await req.json();

//   if (action === "approve") {
//     await db.query(
//       "UPDATE users SET role = 'provider', providerRequestStatus = 'approved' WHERE email = ?",
//       [email]
//     );
//   }

//   if (action === "reject") {
//     await db.query(
//       "UPDATE users SET providerRequestStatus = 'rejected' WHERE email = ?",
//       [email]
//     );
//   }

//   return NextResponse.json({ success: true });
// }


// // export async function GET() {
// //   const requests = await prisma.providerRequest.findMany({
// //     orderBy: { createdAt: "desc" },
// //   });

// //   return Response.json(requests);
// // }



import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const requests = await prisma.providerRequest.findMany({
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(requests);
}
