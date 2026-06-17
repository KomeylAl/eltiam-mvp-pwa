import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  if (pathname === "/home" || pathname === "/") {
    return NextResponse.redirect(new URL("/home/measurements", req.url));
  }

  if (!token && !pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (token && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/home/measurements", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/", "/auth/:path*"],
};
