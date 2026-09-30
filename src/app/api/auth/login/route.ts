import { NextResponse } from "next/server";
import { spotifyEnv } from "@/lib/env";
import { createChallenge, createVerifier } from "@/lib/pkce";
import { COOKIES, cookieBase } from "@/lib/session";

export async function GET() {
  const env = spotifyEnv();
  const verifier = createVerifier();
  const state = createVerifier();
  const challenge = await createChallenge(verifier);
  const url = new URL("/authorize", env.accounts);

  url.searchParams.set("client_id", env.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", env.redirectUri);
  url.searchParams.set("scope", "user-top-read");
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", state);

  const response = NextResponse.redirect(url);
  const base = { ...cookieBase(), maxAge: 600 };
  response.cookies.set(COOKIES.verifier, verifier, base);
  response.cookies.set(COOKIES.state, state, base);
  return response;
}
