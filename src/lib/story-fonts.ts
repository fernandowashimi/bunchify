const TRUETYPE_AGENT =
  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1";

export async function loadGoogleFont(
  family: string,
  weight: number,
  fetchImpl: typeof fetch = fetch,
  italic = false,
): Promise<ArrayBuffer> {
  const axis = italic ? `ital,wght@1,${weight}` : `wght@${weight}`;
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family.replaceAll(" ", "+")}:${axis}`;
  const cssResponse = await fetchImpl(cssUrl, { headers: { "User-Agent": TRUETYPE_AGENT } });
  if (!cssResponse.ok) throw new Error(`Could not load ${family}.`);

  const match = (await cssResponse.text()).match(
    /src: url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\) format\('truetype'\)/,
  );
  if (!match) throw new Error(`Could not load ${family}.`);

  const fontResponse = await fetchImpl(match[1]);
  if (!fontResponse.ok) throw new Error(`Could not load ${family}.`);
  return fontResponse.arrayBuffer();
}

export type StoryFontSet = {
  syne: ArrayBuffer;
  dmSans: ArrayBuffer;
  numbers: ArrayBuffer;
};

let fontsPromise: Promise<StoryFontSet> | null = null;

export function storyFonts() {
  fontsPromise ??= Promise.all([
    loadGoogleFont("Syne", 800),
    loadGoogleFont("DM Sans", 500),
    loadGoogleFont("Instrument Serif", 400, fetch, true),
  ])
    .then(([syne, dmSans, numbers]) => ({ syne, dmSans, numbers }))
    .catch((error: unknown) => {
      fontsPromise = null;
      throw error;
    });
  return fontsPromise;
}

export function storyFontOptions(fonts: StoryFontSet) {
  return [
    { name: "Syne", data: fonts.syne, weight: 800 as const, style: "normal" as const },
    { name: "DM Sans", data: fonts.dmSans, weight: 500 as const, style: "normal" as const },
    { name: "Instrument Serif", data: fonts.numbers, weight: 400 as const, style: "italic" as const },
  ];
}
