import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { appUrl } from "@/lib/env";
import { PKCE_COOKIES, safeEqual } from "@/lib/pkce";
import { cookieBase, store } from "@/lib/session";
import { exchangeCode } from "@/lib/spotify";

function fail(error: "denied" | "failed") {
  const response = NextResponse.redirect(appUrl(`/authorize?error=${error}`));
  const expired = { ...cookieBase(), maxAge: 0 };
  response.cookies.set(PKCE_COOKIES.verifier, "", expired);
  response.cookies.set(PKCE_COOKIES.state, "", expired);
  return response;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const oauthError = params.get("error");
  if (oauthError === "access_denied") return fail("denied");
  if (oauthError) return fail("failed");

  const code = params.get("code");
  const state = params.get("state");
  const expected = request.cookies.get(PKCE_COOKIES.state)?.value;
  const verifier = request.cookies.get(PKCE_COOKIES.verifier)?.value;

  if (!code || !state || !expected || !verifier || !safeEqual(state, expected)) {
    return fail("failed");
  }

  const tokens = await exchangeCode(code, verifier);
  if (!tokens?.access_token) return fail("failed");

  const response = NextResponse.redirect(appUrl("/"));
  store(tokens, {
    read: request.cookies,
    write: response.cookies,
  });
  const base = cookieBase();
  response.cookies.set(PKCE_COOKIES.verifier, "", { ...base, maxAge: 0 });
  response.cookies.set(PKCE_COOKIES.state, "", { ...base, maxAge: 0 });
  return response;
}
