import assert from "node:assert/strict";
import test from "node:test";
import {
  createSession,
  present,
  store,
  SessionError,
  type CookieRead,
  type CookieWrite,
  type RefreshResult,
} from "./session";

const ACCESS = "bunchify_access";
const REFRESH = "bunchify_refresh";
const EXPIRY = "bunchify_expiry";
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

type Entry = { value: string; maxAge?: number };

function memoryJar(initial: Record<string, string> = {}) {
  const map = new Map<string, Entry>();
  for (const [name, value] of Object.entries(initial)) {
    map.set(name, { value });
  }

  const jar: CookieRead & CookieWrite & { snapshot: () => Map<string, Entry> } = {
    get(name) {
      const entry = map.get(name);
      return entry ? { value: entry.value } : undefined;
    },
    set(name, value, options) {
      map.set(name, { value, maxAge: options.maxAge });
    },
    delete(name) {
      map.delete(name);
    },
    snapshot() {
      return new Map(map);
    },
  };

  return jar;
}

test("present is true when an access or refresh cookie exists", () => {
  assert.equal(present(memoryJar()), false);
  assert.equal(present(memoryJar({ [ACCESS]: "token" })), true);
  assert.equal(present(memoryJar({ [REFRESH]: "token" })), true);
  assert.equal(present(memoryJar({ [EXPIRY]: String(Date.now()) })), false);
});

test("store writes access, refresh, and expiry with retention", () => {
  const now = 1_700_000_000_000;
  const write = memoryJar();
  const read = memoryJar({ [REFRESH]: "previous-refresh" });

  store(
    { access_token: "new-access", expires_in: 120 },
    { read, write },
    () => now,
  );

  const cookies = write.snapshot();
  assert.equal(cookies.get(ACCESS)?.value, "new-access");
  assert.equal(cookies.get(ACCESS)?.maxAge, 120);
  assert.equal(cookies.get(REFRESH)?.value, "previous-refresh");
  assert.equal(cookies.get(REFRESH)?.maxAge, REFRESH_MAX_AGE);
  assert.equal(cookies.get(EXPIRY)?.value, String(now + 120_000));
  assert.equal(cookies.get(EXPIRY)?.maxAge, 120);
});

test("store prefers a refresh_token on the grant", () => {
  const write = memoryJar();
  const read = memoryJar({ [REFRESH]: "previous-refresh" });

  store(
    {
      access_token: "new-access",
      refresh_token: "rotated-refresh",
      expires_in: 3600,
    },
    { read, write },
    () => 0,
  );

  assert.equal(write.get(REFRESH)?.value, "rotated-refresh");
});

test("bearer returns a fresh access token without refreshing", async () => {
  const now = 1_700_000_000_000;
  const jar = memoryJar({
    [ACCESS]: "fresh-access",
    [REFRESH]: "refresh",
    [EXPIRY]: String(now + 60_000),
  });
  let refreshed = false;
  const session = createSession({
    cookies: () => jar,
    now: () => now,
    refresh: async () => {
      refreshed = true;
      return { access_token: "should-not-run" };
    },
  });

  assert.equal(await session.bearer(), "fresh-access");
  assert.equal(refreshed, false);
});

test("bearer refreshes inside the skew and rewrites the previous refresh token", async () => {
  const now = 1_700_000_000_000;
  const jar = memoryJar({
    [ACCESS]: "old-access",
    [REFRESH]: "old-refresh",
    [EXPIRY]: String(now + 10_000),
  });
  const seen: string[] = [];
  const session = createSession({
    cookies: () => jar,
    now: () => now,
    refresh: async (refreshToken) => {
      seen.push(refreshToken);
      return { access_token: "new-access", expires_in: 1800 };
    },
  });

  assert.equal(await session.bearer(), "new-access");
  assert.deepEqual(seen, ["old-refresh"]);
  assert.equal(jar.get(ACCESS)?.value, "new-access");
  assert.equal(jar.get(REFRESH)?.value, "old-refresh");
  assert.equal(jar.get(EXPIRY)?.value, String(now + 1_800_000));
  assert.equal(jar.snapshot().get(REFRESH)?.maxAge, REFRESH_MAX_AGE);
  assert.equal(jar.snapshot().get(ACCESS)?.maxAge, 1800);
});

test("bearer force refreshes even when the access cookie is fresh", async () => {
  const now = 1_700_000_000_000;
  const jar = memoryJar({
    [ACCESS]: "fresh-access",
    [REFRESH]: "old-refresh",
    [EXPIRY]: String(now + 60_000),
  });
  const session = createSession({
    cookies: () => jar,
    now: () => now,
    refresh: async () => ({ access_token: "forced-access", expires_in: 60 }),
  });

  assert.equal(await session.bearer({ force: true }), "forced-access");
  assert.equal(jar.get(ACCESS)?.value, "forced-access");
});

test("bearer clears and throws Session missing when no refresh cookie exists", async () => {
  const now = 1_700_000_000_000;
  const jar = memoryJar({
    [ACCESS]: "stale-access",
    [EXPIRY]: String(now),
  });
  const session = createSession({
    cookies: () => jar,
    now: () => now,
    refresh: async () => ({ access_token: "unused" }),
  });

  await assert.rejects(() => session.bearer(), (error: unknown) => {
    assert.ok(error instanceof SessionError);
    assert.equal(error.message, "Session missing.");
    assert.equal(error.status, 401);
    return true;
  });
  assert.equal(jar.get(ACCESS), undefined);
  assert.equal(jar.get(REFRESH), undefined);
  assert.equal(jar.get(EXPIRY), undefined);
});

test("bearer clears and throws Session expired when refresh returns no access token", async () => {
  const jar = memoryJar({
    [ACCESS]: "old-access",
    [REFRESH]: "old-refresh",
    [EXPIRY]: "0",
  });
  const session = createSession({
    cookies: () => jar,
    now: () => 0,
    refresh: async () => null,
  });

  await assert.rejects(() => session.bearer(), (error: unknown) => {
    assert.ok(error instanceof SessionError);
    assert.equal(error.message, "Session expired.");
    assert.equal(error.status, 401);
    return true;
  });
  assert.equal(jar.get(ACCESS), undefined);
  assert.equal(jar.get(REFRESH), undefined);
  assert.equal(jar.get(EXPIRY), undefined);
});

test("bearer leaves cookies in place when refresh throws", async () => {
  const jar = memoryJar({
    [ACCESS]: "old-access",
    [REFRESH]: "old-refresh",
    [EXPIRY]: "0",
  });
  const session = createSession({
    cookies: () => jar,
    now: () => 0,
    refresh: async () => {
      throw new Error("network down");
    },
  });

  await assert.rejects(() => session.bearer(), /network down/);
  assert.equal(jar.get(ACCESS)?.value, "old-access");
  assert.equal(jar.get(REFRESH)?.value, "old-refresh");
  assert.equal(jar.get(EXPIRY)?.value, "0");
});

test("clear removes the three Session cookies on a given write jar", async () => {
  const jar = memoryJar({
    [ACCESS]: "access",
    [REFRESH]: "refresh",
    [EXPIRY]: "1",
  });
  const session = createSession({
    cookies: () => memoryJar({ [ACCESS]: "other" }),
    refresh: async () => null,
  });

  await session.clear(jar);
  assert.equal(jar.get(ACCESS), undefined);
  assert.equal(jar.get(REFRESH), undefined);
  assert.equal(jar.get(EXPIRY), undefined);
});

test("bearer returns a fresh access token even without a refresh cookie", async () => {
  const now = 1_700_000_000_000;
  const jar = memoryJar({
    [ACCESS]: "fresh-access",
    [EXPIRY]: String(now + 60_000),
  });
  const session = createSession({
    cookies: () => jar,
    now: () => now,
    refresh: async (): Promise<RefreshResult | null> => {
      throw new Error("should not refresh");
    },
  });

  assert.equal(await session.bearer(), "fresh-access");
});
