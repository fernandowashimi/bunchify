import { session, requestToken } from "@/lib/session-request";
import { SessionError } from "@/lib/session";
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

function rethrowSession(error: unknown): never {
  if (error instanceof SessionError) {
    throw new SpotifyError(error.message, error.status);
  }
  throw error;
}

async function accessBearer(options?: { force?: boolean }) {
  try {
    return await session.bearer(options);
  } catch (error) {
    rethrowSession(error);
  }
}

async function spotifyFetch(path: string) {
  const env = spotifyEnv();
  const call = (bearer: string) =>
    fetch(`${env.api}${path}`, {
      headers: { Authorization: `Bearer ${bearer}` },
      cache: "no-store",
    });

  let token = await accessBearer();
  let response = await call(token);
  if (response.status === 401) {
    token = await accessBearer({ force: true });
    response = await call(token);
  }

  if (response.status === 401) {
    await session.clear();
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
  ) as Promise<TokenResponse | null>;
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
