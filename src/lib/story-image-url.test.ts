import assert from "node:assert/strict";
import test from "node:test";
import { allowedStoryImageUrl } from "./story-image-url";

const api = "http://127.0.0.1:4010";

test("allows Spotify image hosts over https", () => {
  assert.equal(allowedStoryImageUrl("https://i.scdn.co/image/ab", api)?.hostname, "i.scdn.co");
  assert.equal(allowedStoryImageUrl("https://mosaic.scdn.co/640/ab", api)?.hostname, "mosaic.scdn.co");
  assert.equal(
    allowedStoryImageUrl("https://image-cdn-ak.spotifycdn.com/image/ab", api)?.hostname,
    "image-cdn-ak.spotifycdn.com",
  );
});

test("allows cover art on the configured Spotify API host", () => {
  assert.equal(
    allowedStoryImageUrl("http://127.0.0.1:4010/cover.png", api)?.href,
    "http://127.0.0.1:4010/cover.png",
  );
});

test("rejects other hosts, cleartext CDNs, and credentials", () => {
  assert.equal(allowedStoryImageUrl("https://evil.example/cover.png", api), null);
  assert.equal(allowedStoryImageUrl("http://i.scdn.co/image/ab", api), null);
  assert.equal(allowedStoryImageUrl("https://i.scdn.co.evil.com/image/ab", api), null);
  assert.equal(allowedStoryImageUrl("http://127.0.0.1:4011/cover.png", api), null);
  assert.equal(allowedStoryImageUrl("https://user:pass@i.scdn.co/image/ab", api), null);
  assert.equal(allowedStoryImageUrl("not a url", api), null);
});
