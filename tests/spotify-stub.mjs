import http from "node:http";
import { deflateSync } from "node:zlib";

const port = Number(process.env.STUB_PORT ?? 4010);
const redirectBase = process.env.STUB_APP_ORIGIN ?? "http://127.0.0.1:3100";

const state = {
  mode: "ok",
  requests: [],
};

const COVER_PALETTE = [
  [238, 31, 157],
  [219, 250, 132],
  [14, 30, 56],
  [90, 40, 112],
  [127, 45, 121],
];

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Solid RGB PNG (no deps) for demo covers in e2e / asset capture. */
function solidPng(size, rgb) {
  const [r, g, b] = rgb;
  const row = Buffer.alloc(1 + size * 3);
  for (let x = 0; x < size; x++) {
    const i = 1 + x * 3;
    row[i] = r;
    row[i + 1] = g;
    row[i + 2] = b;
  }
  const raw = Buffer.concat(Array.from({ length: size }, () => Buffer.from(row)));
  const compressed = deflateSync(raw);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeBuf = Buffer.from(type);
    const body = Buffer.concat([typeBuf, data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const coverPngs = COVER_PALETTE.map((rgb) => solidPng(320, rgb));
const fallbackPng = coverPngs[0];

function cover(width, index = 0) {
  return {
    url: `http://127.0.0.1:${port}/cover/${index % COVER_PALETTE.length}.png`,
    width,
    height: width,
  };
}

const DEMO_ARTISTS = ["Neon Harbor", "Glass Atlas", "Midnight Relay", "Coral Static", "Violet Circuit"];
const DEMO_TRACKS = ["Signal Bloom", "Harbor Lights", "Static Softly", "Relay Dawn", "Circuit Rain"];

function artists(count) {
  return Array.from({ length: count }, (_, index) => ({
    name: DEMO_ARTISTS[index] ?? `Artist ${index + 1}`,
    images: [cover(640, index), cover(320, index), cover(64, index)],
    external_urls: { spotify: `https://open.spotify.com/artist/demo${index + 1}` },
  }));
}

function tracks(count) {
  return Array.from({ length: count }, (_, index) => ({
    name: DEMO_TRACKS[index] ?? `Track ${index + 1}`,
    artists: [{ name: DEMO_ARTISTS[index] ?? `Artist ${index + 1}` }],
    album: { images: [cover(640, index), cover(300, index), cover(64, index)] },
    external_urls: { spotify: `https://open.spotify.com/track/demo${index + 1}` },
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

  const coverMatch = url.pathname.match(/^\/cover(?:\/(\d+))?\.png$/);
  if (req.method === "GET" && coverMatch) {
    const index = coverMatch[1] ? Number(coverMatch[1]) : 0;
    send(res, 200, coverPngs[index] ?? fallbackPng);
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
