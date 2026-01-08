// import { getToken } from "next-auth/jwt";
// import { NextResponse } from "next/server";

// export async function middleware(req) {
//   const token = await getToken({
//     req,
//     secret: process.env.NEXTAUTH_SECRET,
//   });

//   const { pathname } = req.nextUrl;

//   if (!token) {
//     return NextResponse.next();
//   }

//   console.log(token, 'token')
//   const isProviderAtFirst = token.isProviderAtFirst === true;
//   const isProvider = token.role === "provider";


//   // const pathname = req.nextUrl.pathname;

//   // // Protect admin routes
//   // if (pathname.startsWith("/admin")) {
//   //   if (token?.role !== "admin") {
//   //     return NextResponse.redirect(new URL("/", req.url));
//   //   }
//   // }

//   // // Provider only  
//   // if (pathname === "/") {
//   //   if (token?.role === "provider" && token?.isProviderAtFirst) {
//   //     return NextResponse.redirect(new URL("/providerDashboard", req.url));
//   //   }
//   // }

//   // Protect provider routes
//   // if (pathname.startsWith("/provider")) {
//   //   if (token?.role !== "provider") {
//   //     return NextResponse.redirect(new URL("/", req.url));
//   //   }
//   // }

//     if (isProviderAtFirst) {
//     // Allow provider pages
//     if (
//       pathname.startsWith("/provider") ||
//       pathname.startsWith("/providerDashboard")
//     ) {
//       return NextResponse.next();
//     }

//     // Block everything else
//     return NextResponse.redirect(
//       new URL("/providerDashboard", req.url)
//     );
//   }

//   return NextResponse.next();
// }


// import { getToken } from "next-auth/jwt";
// import { NextResponse } from "next/server";

// export async function middleware(req) {
//   const token = await getToken({
//     req,
//     secret: process.env.NEXTAUTH_SECRET,
//   });

//   const { pathname } = req.nextUrl;

//   if (!token) {
//     return NextResponse.next();
//   }

//   const { role, isProviderAtFirst } = token;

//   /* ================= PROVIDER DASHBOARD ================= */
//   if (pathname.startsWith("/providerDashboard")) {
//     if (role !== "provider") {
//       return NextResponse.redirect(new URL("/", req.url));
//     }
//   }

//   /* ================= SEEKER DASHBOARD (HOME) ================= */
//   if (pathname === "/") {
//     // Provider-first users should NOT see seeker dashboard
//     if (isProviderAtFirst===0) {
//       return NextResponse.redirect(
//         new URL("/providerDashboard", req.url)
//       );
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/", "/providerDashboard/:path*"],
// };



import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  if (!token) {
    return NextResponse.next();
  }

  const isProviderAtFirst =
    token.isProviderAtFirst === true || token.isProviderAtFirst === 1;

  /* =====================================================
     PROVIDER AT FIRST → STRICT REDIRECT
  ===================================================== */
  if (isProviderAtFirst) {
    if (
      pathname === "/providerDashboard" ||
      pathname.startsWith("/provider/")
    ) {
      return NextResponse.next();
    }

    return NextResponse.redirect(
      new URL("/providerDashboard", req.url)
    );
  }

  return NextResponse.next();
}

/* =====================================================
   ENSURE MIDDLEWARE RUNS ON "/"
===================================================== */
export const config = {
  matcher: [
    "/",
    "/role-selection",
    "/provider/:path*",
    "/providerDashboard",
    "/seekerDashboard",
  ],
};
