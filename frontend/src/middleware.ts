import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const sessionId = req.cookies.get("sid")?.value;
  //const { pathname } = req.nextUrl;

  // const isProtectedRoute =
  //   pathname.startsWith("/dashboard") || pathname.startsWith("/users");
  const res = NextResponse.next();
  if (sessionId) {
    res.headers.set("x-user", "authenticated");
  }
  return NextResponse.next();
}
