import { cookies } from "next/headers";
import { COOKIES, cookieBase } from "@/lib/session";
import { spotifyEnv } from "@/lib/env";

export class SpotifyError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
};

type Image = { url?: string; width?: number; height?: number };

export type ListenerProfile = {
  displayName: string;
  images: Image[];
};

export type TopItem = {
  name: string;
  artist?: string;
  images: Image[];
};

const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

async function requestToken(body: URLSearchParams) {
  const env = spotifyEnv();
  if (env.clientSecret) body.set("client_secret", env.clientSecret);

  const response = await fetch(new URL("/api/token", env.accounts), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!response.ok) return null;
  return (await response.json()) as TokenResponse;
}

async function saveSession(tokens: TokenResponse, previousRefresh?: string) {
  const store = await cookies();
  const base = cookieBase();
  const expiresIn = tokens.expires_in ?? 3600;
  store.set(COOKIES.access, tokens.access_token, { ...base, maxAge: expiresIn });
  const refresh = tokens.refresh_token ?? previousRefresh;
  if (refresh) {
    store.set(COOKIES.refresh, refresh, { ...base, maxAge: REFRESH_MAX_AGE });
  }
  store.set(COOKIES.expiry, String(Date.now() + expiresIn * 1000), {
    ...base,
    maxAge: expiresIn,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIES.access);
  store.delete(COOKIES.refresh);
  store.delete(COOKIES.expiry);
}

async function refreshAccess(refreshToken: string) {
  const tokens = await requestToken(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: spotifyEnv().clientId,
    }),
  );

  if (!tokens?.access_token) {
    await clearSession();
    throw new SpotifyError("Session expired.", 401);
  }

  await saveSession(tokens, refreshToken);
  return tokens.access_token;
}

async function accessToken() {
  const store = await cookies();
  const access = store.get(COOKIES.access)?.value;
  const refresh = store.get(COOKIES.refresh)?.value;
  const expiry = Number(store.get(COOKIES.expiry)?.value ?? 0);

  if (access && expiry > Date.now() + 15_000) return access;
  if (!refresh) {
    await clearSession();
    throw new SpotifyError("Session missing.", 401);
  }

  return refreshAccess(refresh);
}

async function spotifyFetch(path: string) {
  const env = spotifyEnv();
  let token = await accessToken();

  const call = (bearer: string) =>
    fetch(`${env.api}${path}`, {
      headers: { Authorization: `Bearer ${bearer}` },
      cache: "no-store",
    });

  let response = await call(token);
  if (response.status === 401) {
    const refresh = (await cookies()).get(COOKIES.refresh)?.value;
    if (!refresh) {
      await clearSession();
      throw new SpotifyError("Session missing.", 401);
    }
    token = await refreshAccess(refresh);
    response = await call(token);
  }

  if (response.status === 401) {
    await clearSession();
    throw new SpotifyError("Session expired.", 401);
  }

  if (!response.ok) {
    throw new SpotifyError("Spotify request failed.", 502);
  }

  return response;
}

export async function exchangeCode(code: string, verifier: string) {
  const env = spotifyEnv();
  return requestToken(
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: env.redirectUri,
      client_id: env.clientId,
      code_verifier: verifier,
    }),
  );
}

export function applySession(
  set: (name: string, value: string, maxAge: number) => void,
  tokens: TokenResponse,
) {
  const expiresIn = tokens.expires_in ?? 3600;
  set(COOKIES.access, tokens.access_token, expiresIn);
  if (tokens.refresh_token) set(COOKIES.refresh, tokens.refresh_token, REFRESH_MAX_AGE);
  set(COOKIES.expiry, String(Date.now() + expiresIn * 1000), expiresIn);
}

export async function getProfile(): Promise<ListenerProfile> {
  const response = await spotifyFetch("/v1/me");
  const data = (await response.json()) as { display_name?: string; images?: Image[] };
  return {
    displayName: data.display_name ?? "",
    images: data.images ?? [],
  };
}

export async function getTop(type: "artists" | "tracks", range: string): Promise<TopItem[]> {
  const response = await spotifyFetch(`/v1/me/top/${type}?time_range=${range}&limit=5`);
  const data = (await response.json()) as {
    items?: Array<{
      name?: string;
      images?: Image[];
      artists?: Array<{ name?: string }>;
      album?: { images?: Image[] };
    }>;
  };

  return (data.items ?? []).map((item) => {
    if (type === "tracks") {
      return {
        name: item.name ?? "",
        artist: item.artists?.[0]?.name ?? "",
        images: item.album?.images ?? [],
      };
    }
    return {
      name: item.name ?? "",
      images: item.images ?? [],
    };
  });
}

export function storyImage(images: Image[] | undefined) {
  const list = images ?? [];
  const mid = list[1]?.url;
  if (mid) return mid;
  const largest = [...list]
    .filter((image) => image.url)
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0];
  return largest?.url ?? null;
}

export const TOP_TYPES = ["artists", "tracks"] as const;
export const TOP_RANGES = ["short_term", "medium_term", "long_term"] as const;

export type TopType = (typeof TOP_TYPES)[number];
export type TopRange = (typeof TOP_RANGES)[number];

export function isTopType(value: string | null): value is TopType {
  return TOP_TYPES.includes(value as TopType);
}

export function isTopRange(value: string | null): value is TopRange {
  return TOP_RANGES.includes(value as TopRange);
}
