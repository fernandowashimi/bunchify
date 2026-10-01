import { NextResponse } from "next/server";
import { appUrl } from "@/lib/env";
import { COOKIES, cookieBase } from "@/lib/session";

export function GET() {
  const response = NextResponse.redirect(appUrl("/authorize"));
  const expired = { ...cookieBase(), maxAge: 0 };
  for (const name of Object.values(COOKIES)) {
    response.cookies.set(name, "", expired);
  }
  return response;
}
