import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const hasSessionCookie = /(?:^|;\s*)(?:__Secure-)?better-auth\.session_token=/.test(cookieHeader);
  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
