import assert from "node:assert/strict";
import test from "node:test";
import { loadRobotoMono } from "./roboto-mono";

const css = `@font-face {
  font-family: 'Roboto Mono';
  font-style: normal;
  font-weight: 500;
  src: url(https://fonts.gstatic.com/s/robotomono/v31/roboto.ttf) format('truetype');
}`;

test("loadRobotoMono reads the truetype file from the Google stylesheet", async () => {
  const calls: string[] = [];
  const font = new Uint8Array([1, 2, 3, 4]).buffer;
  const fetchImpl: typeof fetch = async (input) => {
    const url = String(input);
    calls.push(url);
    if (url.startsWith("https://fonts.googleapis.com/")) {
      return new Response(css, { status: 200 });
    }
    assert.equal(url, "https://fonts.gstatic.com/s/robotomono/v31/roboto.ttf");
    return new Response(font, { status: 200 });
  };

  const bytes = await loadRobotoMono(fetchImpl);
  assert.deepEqual(new Uint8Array(bytes), new Uint8Array([1, 2, 3, 4]));
  assert.deepEqual(calls, [
    "https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@500",
    "https://fonts.gstatic.com/s/robotomono/v31/roboto.ttf",
  ]);
});

test("loadRobotoMono fails when Google does not offer a truetype file", async () => {
  const fetchImpl: typeof fetch = async () => new Response("/* woff2 only */", { status: 200 });
  await assert.rejects(loadRobotoMono(fetchImpl), /Roboto Mono/);
});
