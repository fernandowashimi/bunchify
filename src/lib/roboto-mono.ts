const STYLESHEET = "https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@500";

// A current browser is sent woff2. ImageResponse can parse truetype, which this older agent receives.
const TRUETYPE_AGENT =
  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1";

export async function loadRobotoMono(fetchImpl: typeof fetch = fetch): Promise<ArrayBuffer> {
  const cssResponse = await fetchImpl(STYLESHEET, {
    headers: { "User-Agent": TRUETYPE_AGENT },
  });
  if (!cssResponse.ok) throw new Error("Could not load Roboto Mono.");

  const match = (await cssResponse.text()).match(
    /src: url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\) format\('truetype'\)/,
  );
  if (!match) throw new Error("Could not load Roboto Mono.");

  const fontResponse = await fetchImpl(match[1]);
  if (!fontResponse.ok) throw new Error("Could not load Roboto Mono.");
  return fontResponse.arrayBuffer();
}
