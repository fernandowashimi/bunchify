export const COOKIES = {
  access: "bunchify_access",
  refresh: "bunchify_refresh",
  expiry: "bunchify_expiry",
  verifier: "bunchify_pkce",
  state: "bunchify_state",
} as const;

export function cookieBase() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  };
}
