import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requestOrigin } from "@/lib/request-origin";
import { COOKIES } from "@/lib/session";

export function proxy(request: NextRequest) {
  const hasSession =
    request.cookies.has(COOKIES.access) || request.cookies.has(COOKIES.refresh);
  const { pathname } = request.nextUrl;
  const origin = requestOrigin(request);

  if (pathname === "/" && !hasSession) {
    return NextResponse.redirect(new URL("/authorize", origin));
  }

  if (pathname === "/authorize" && hasSession) {
    return NextResponse.redirect(new URL("/", origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/authorize"],
};
