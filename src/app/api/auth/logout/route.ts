import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIES, cookieBase } from "@/lib/session";

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/authorize", request.url));
  const expired = { ...cookieBase(), maxAge: 0 };
  for (const name of Object.values(COOKIES)) {
    response.cookies.set(name, "", expired);
  }
  return response;
}
