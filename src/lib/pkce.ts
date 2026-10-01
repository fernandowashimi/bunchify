import { timingSafeEqual } from "node:crypto";

export const PKCE_COOKIES = {
  verifier: "bunchify_pkce",
  state: "bunchify_state",
} as const;

function base64url(bytes: Uint8Array) {
  return Buffer.from(bytes)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

export function createVerifier() {
  return base64url(crypto.getRandomValues(new Uint8Array(32)));
}

export async function createChallenge(verifier: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64url(new Uint8Array(digest));
}

export function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
