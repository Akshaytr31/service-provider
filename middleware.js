import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req });
  const path = req.nextUrl.pathname;

  // Paths that should not be accessible if already logged in
  const authPaths = ["/login", "/signup"];

  if (token && authPaths.includes(path)) {
    const { role } = token;

    if (role === "admin") {
      return NextResponse.redirect(new URL("/adminDashboard", req.url));
    } else if (role === "provider") {
      return NextResponse.redirect(new URL("/providerDashboard", req.url));
    } else if (role === "seeker") {
      return NextResponse.redirect(new URL("/seakerDashboard", req.url));
    }
  }

  if (!token) return NextResponse.next();

  const { role, isProviderAtFirst } = token;

  // Admin restriction
  // if (path.startsWith("/admin") && role !== "admin") {
  //   return NextResponse.redirect(new URL("/unauthorized", req.url));
  // }

  // Provider-first users cannot access "/"
  if (path === "/" && role === "provider" && isProviderAtFirst === 1) {
    return NextResponse.redirect(new URL("/providerDashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/providerDashboard/:path*",
    "/login",
    "/signup",
  ],
};
