import http from "node:http";

const port = Number(process.env.STUB_PORT ?? 4010);
const redirectBase = process.env.STUB_APP_ORIGIN ?? "http://127.0.0.1:3100";

const state = {
  mode: "ok",
  requests: [],
};

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

function cover(width) {
  return { url: `http://127.0.0.1:${port}/cover.png`, width, height: width };
}

function artists(count) {
  return Array.from({ length: count }, (_, index) => ({
    name: `Artist ${index + 1}`,
    images: [cover(640), cover(320), cover(64)],
  }));
}

function tracks(count) {
  return Array.from({ length: count }, (_, index) => ({
    name: `Track ${index + 1}`,
    artists: [{ name: `Artist ${index + 1}` }],
    album: { images: [cover(640), cover(300), cover(64)] },
  }));
}

function send(res, status, body, headers = {}) {
  const payload = typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, {
    "content-type": Buffer.isBuffer(body) ? "image/png" : "application/json",
    ...headers,
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
  state.requests.push(`${req.method} ${url.pathname}${url.search}`);

  if (req.method === "POST" && url.pathname === "/__control") {
    const body = JSON.parse((await readBody(req)) || "{}");
    state.mode = body.mode ?? "ok";
    state.requests = [];
    send(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && url.pathname === "/__requests") {
    send(res, 200, { requests: state.requests });
    return;
  }

  if (req.method === "GET" && url.pathname === "/cover.png") {
    send(res, 200, png);
    return;
  }

  if (req.method === "GET" && url.pathname === "/authorize") {
    const redirectUri = url.searchParams.get("redirect_uri");
    const callback = redirectUri
      ? new URL(redirectUri)
      : new URL("/api/auth/callback", redirectBase);
    if (state.mode === "deny") {
      callback.searchParams.set("error", "access_denied");
      callback.searchParams.set("state", url.searchParams.get("state") ?? "");
    } else {
      callback.searchParams.set("code", "test-code");
      callback.searchParams.set("state", url.searchParams.get("state") ?? "");
    }
    res.writeHead(302, { location: callback.toString() });
    res.end();
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/token") {
    send(res, 200, {
      access_token: "test-access-token",
      refresh_token: "test-refresh-token",
      expires_in: 3600,
      token_type: "Bearer",
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/v1/me") {
    send(res, 200, {
      display_name: "Ada Lovelace",
      images: [cover(300)],
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/v1/me/top/artists") {
    const count = state.mode === "insufficient" ? 2 : 5;
    send(res, 200, { items: artists(count) });
    return;
  }

  if (req.method === "GET" && url.pathname === "/v1/me/top/tracks") {
    const count = state.mode === "insufficient" ? 2 : 5;
    send(res, 200, { items: tracks(count) });
    return;
  }

  send(res, 404, { error: "not found" });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`spotify stub on ${port}`);
});
