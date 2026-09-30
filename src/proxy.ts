import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIES } from "@/lib/session";

export function proxy(request: NextRequest) {
  const hasSession =
    request.cookies.has(COOKIES.access) || request.cookies.has(COOKIES.refresh);
  const { pathname } = request.nextUrl;

  if (pathname === "/" && !hasSession) {
    return NextResponse.redirect(new URL("/authorize", request.url));
  }

  if (pathname === "/authorize" && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/authorize"],
};
