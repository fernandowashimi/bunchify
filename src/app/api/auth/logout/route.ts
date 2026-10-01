import { NextResponse } from "next/server";
import { appUrl } from "@/lib/env";
import { PKCE_COOKIES } from "@/lib/pkce";
import { cookieBase } from "@/lib/session";
import { session } from "@/lib/session-request";

export async function GET() {
  const response = NextResponse.redirect(appUrl("/authorize"));
  await session.clear(response.cookies);
  const expired = { ...cookieBase(), maxAge: 0 };
  response.cookies.set(PKCE_COOKIES.verifier, "", expired);
  response.cookies.set(PKCE_COOKIES.state, "", expired);
  return response;
}
