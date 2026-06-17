import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  const { pathname } = req.nextUrl;

  if (pathname === "/home" || pathname === "/") {
    return NextResponse.redirect(new URL("/home/measurements", req.url));
  }

  if (!token && !pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (token && pathname === "/auth/login") {
    return NextResponse.redirect(new URL("/home/measurements", req.url));
  }

  if (token) {
    try {
      const decoded = jwt.decode(token) as JwtPayload | null;

      if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
        if (refreshToken) {
          const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
          const response = await fetch(`${baseUrl}/api/auth/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });

          if (response.ok) {
            const { accessToken } = await response.json();

            const res = NextResponse.next();
            res.cookies.set("token", accessToken, {
              httpOnly: true,
              path: "/",
              maxAge: 3600,
            });
            return res;
          }
        }
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
    } catch (error) {
      console.error("Invalid token:", error);
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/", "/auth/:path*"],
};
