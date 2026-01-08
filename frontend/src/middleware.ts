import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const sessionId = req.cookies.get("sid")?.value;
  const { pathname } = req.nextUrl;

  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/users");

  if (!sessionId && isProtectedRoute) {
    const loginUrl = new URL("/signin", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/users/:path*"],
};
