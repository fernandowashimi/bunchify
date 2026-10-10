import assert from "node:assert/strict";
import { test } from "node:test";
import { spotifyContentUrl } from "@/lib/spotify";

test("accepts open.spotify.com https links", () => {
  assert.equal(
    spotifyContentUrl("https://open.spotify.com/artist/abc"),
    "https://open.spotify.com/artist/abc",
  );
});

test("rejects non-Spotify hosts and non-https", () => {
  assert.equal(spotifyContentUrl("https://example.com/artist/abc"), null);
  assert.equal(spotifyContentUrl("http://open.spotify.com/artist/abc"), null);
  assert.equal(spotifyContentUrl(undefined), null);
  assert.equal(spotifyContentUrl("not-a-url"), null);
});
