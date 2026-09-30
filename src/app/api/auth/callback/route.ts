import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { safeEqual } from "@/lib/pkce";
import { COOKIES, cookieBase } from "@/lib/session";
import { applySession, exchangeCode } from "@/lib/spotify";

function fail(request: NextRequest, error: "denied" | "failed") {
  const response = NextResponse.redirect(new URL(`/authorize?error=${error}`, request.url));
  const expired = { ...cookieBase(), maxAge: 0 };
  response.cookies.set(COOKIES.verifier, "", expired);
  response.cookies.set(COOKIES.state, "", expired);
  return response;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const oauthError = params.get("error");
  if (oauthError === "access_denied") return fail(request, "denied");
  if (oauthError) return fail(request, "failed");

  const code = params.get("code");
  const state = params.get("state");
  const expected = request.cookies.get(COOKIES.state)?.value;
  const verifier = request.cookies.get(COOKIES.verifier)?.value;

  if (!code || !state || !expected || !verifier || !safeEqual(state, expected)) {
    return fail(request, "failed");
  }

  const tokens = await exchangeCode(code, verifier);
  if (!tokens?.access_token) return fail(request, "failed");

  const response = NextResponse.redirect(new URL("/", request.url));
  const base = cookieBase();
  applySession((name, value, maxAge) => {
    response.cookies.set(name, value, { ...base, maxAge });
  }, tokens);
  response.cookies.set(COOKIES.verifier, "", { ...base, maxAge: 0 });
  response.cookies.set(COOKIES.state, "", { ...base, maxAge: 0 });
  return response;
}
