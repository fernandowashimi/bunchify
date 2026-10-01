export const COOKIES = {
  access: "bunchify_access",
  refresh: "bunchify_refresh",
  expiry: "bunchify_expiry",
} as const;

export function cookieBase() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    path: "/" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export type CookieRead = {
  get(name: string): { value: string } | undefined;
};

export type CookieWrite = {
  set(
    name: string,
    value: string,
    options: {
      httpOnly: true;
      sameSite: "lax";
      path: "/";
      secure: boolean;
      maxAge: number;
    },
  ): void;
  delete(name: string): void;
};

export type CookieJar = CookieRead & CookieWrite;

export type AccessGrant = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
};

export type RefreshResult = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
};

export class SessionError extends Error {
  readonly status: number;

  constructor(message: "Session missing." | "Session expired.", status: 401) {
    super(message);
    this.name = "SessionError";
    this.status = status;
  }
}

const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;
const ACCESS_SKEW_MS = 15_000;
const DEFAULT_ACCESS_MAX_AGE = 3600;

export function present(cookies: CookieRead): boolean {
  return Boolean(cookies.get(COOKIES.access) || cookies.get(COOKIES.refresh));
}

function writeTokens(
  write: CookieWrite,
  read: CookieRead,
  grant: AccessGrant,
  now: () => number,
) {
  const base = cookieBase();
  const expiresIn = grant.expires_in ?? DEFAULT_ACCESS_MAX_AGE;
  write.set(COOKIES.access, grant.access_token, { ...base, maxAge: expiresIn });

  const refresh = grant.refresh_token || read.get(COOKIES.refresh)?.value;
  if (refresh) {
    write.set(COOKIES.refresh, refresh, { ...base, maxAge: REFRESH_MAX_AGE });
  }

  write.set(COOKIES.expiry, String(now() + expiresIn * 1000), {
    ...base,
    maxAge: expiresIn,
  });
}

export function store(
  grant: AccessGrant,
  cookies: { read: CookieRead; write: CookieWrite },
  now: () => number = Date.now,
): void {
  writeTokens(cookies.write, cookies.read, grant, now);
}

export type Session = {
  bearer(options?: { force?: boolean }): Promise<string>;
  clear(cookies?: CookieWrite): Promise<void>;
};

export function createSession(deps: {
  cookies: () => CookieJar | Promise<CookieJar>;
  refresh: (refreshToken: string) => Promise<RefreshResult | null>;
  now?: () => number;
}): Session {
  const now = deps.now ?? Date.now;

  async function clear(cookies?: CookieWrite) {
    const write = cookies ?? (await deps.cookies());
    write.delete(COOKIES.access);
    write.delete(COOKIES.refresh);
    write.delete(COOKIES.expiry);
  }

  async function bearer(options?: { force?: boolean }) {
    const jar = await deps.cookies();
    const access = jar.get(COOKIES.access)?.value;
    const refresh = jar.get(COOKIES.refresh)?.value;
    const expiry = Number(jar.get(COOKIES.expiry)?.value ?? 0);

    if (!options?.force && access && expiry > now() + ACCESS_SKEW_MS) {
      return access;
    }

    if (!refresh) {
      await clear(jar);
      throw new SessionError("Session missing.", 401);
    }

    const tokens = await deps.refresh(refresh);

    if (!tokens?.access_token) {
      await clear(jar);
      throw new SessionError("Session expired.", 401);
    }

    writeTokens(jar, jar, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
    }, now);

    return tokens.access_token;
  }

  return { bearer, clear };
}
