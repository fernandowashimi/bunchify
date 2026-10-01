import { cache } from "react";
import { cookies } from "next/headers";
import { createSession, type CookieJar, type RefreshResult } from "@/lib/session";
import { spotifyEnv } from "@/lib/env";

async function requestToken(body: URLSearchParams): Promise<RefreshResult | null> {
  const env = spotifyEnv();
  if (env.clientSecret) body.set("client_secret", env.clientSecret);

  const response = await fetch(new URL("/api/token", env.accounts), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!response.ok) return null;
  return (await response.json()) as RefreshResult;
}

const headerJar = cache(async (): Promise<CookieJar> => {
  const store = await cookies();
  const overlay = new Map<string, string | undefined>();

  return {
    get(name) {
      if (overlay.has(name)) {
        const value = overlay.get(name);
        return value === undefined ? undefined : { value };
      }
      const cookie = store.get(name);
      return cookie ? { value: cookie.value } : undefined;
    },
    set(name, value, options) {
      store.set(name, value, options);
      overlay.set(name, value);
    },
    delete(name) {
      store.delete(name);
      overlay.set(name, undefined);
    },
  };
});

async function refreshAccessToken(refreshToken: string) {
  return requestToken(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: spotifyEnv().clientId,
    }),
  );
}

export { requestToken };

export const session = createSession({
  cookies: headerJar,
  refresh: refreshAccessToken,
});
