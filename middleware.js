import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req });
  const path = req.nextUrl.pathname;

  if (!token) return NextResponse.next();

  const { role, isProviderAtFirst } = token;

  // Admin restriction
  // if (path.startsWith("/admin") && role !== "admin") {
  //   return NextResponse.redirect(new URL("/unauthorized", req.url));
  // }

  // Provider-first users cannot access "/"
  if (path === "/" && role === "provider" && isProviderAtFirst === 1) {
    return NextResponse.redirect(
      new URL("/providerDashboard", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/providerDashboard/:path*"],
};
