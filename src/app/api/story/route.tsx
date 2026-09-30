import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { HEX_COLOR, INSUFFICIENT_TOP, RANGE_PHRASE } from "@/lib/story-copy";
import { StoryImage, storyRows } from "@/lib/story";
import { getProfile, getTop, isTopRange, isTopType, SpotifyError } from "@/lib/spotify";

export const runtime = "nodejs";

let fontPromise: Promise<Buffer> | null = null;

function robotoMono() {
  fontPromise ??= readFile(
    join(process.cwd(), "node_modules/@fontsource/roboto-mono/files/roboto-mono-latin-500-normal.woff"),
  );
  return fontPromise;
}

function dataUrl(bytes: Buffer, mime: string) {
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

async function renderStory(input: {
  kind: "ARTISTS" | "TRACKS";
  rangePhrase: string;
  displayName: string;
  primary: string;
  secondary: string;
  rows: ReturnType<typeof storyRows>;
  wordmark: string;
  spotifyMark: string;
  font: Buffer;
}) {
  const image = new ImageResponse(
    <StoryImage
      kind={input.kind}
      rangePhrase={input.rangePhrase}
      displayName={input.displayName}
      primary={input.primary}
      secondary={input.secondary}
      rows={input.rows}
      wordmark={input.wordmark}
      spotifyMark={input.spotifyMark}
    />,
    {
      width: 828,
      height: 1792,
      fonts: [{ name: "Roboto Mono", data: input.font, weight: 500, style: "normal" }],
    },
  );

  return image.arrayBuffer();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const range = url.searchParams.get("range");
  const primary = url.searchParams.get("primary");
  const secondary = url.searchParams.get("secondary");

  if (!isTopType(type) || !isTopRange(range)) {
    return Response.json({ error: "Invalid top." }, { status: 400 });
  }

  if (!primary || !secondary || !HEX_COLOR.test(primary) || !HEX_COLOR.test(secondary)) {
    return Response.json({ error: "Invalid colors." }, { status: 400 });
  }

  try {
    const [profile, items] = await Promise.all([getProfile(), getTop(type, range)]);
    if (items.length < 5) {
      return Response.json({ error: INSUFFICIENT_TOP }, { status: 422 });
    }

    const [font, wordmark, spotifyMark] = await Promise.all([
      robotoMono(),
      readFile(join(process.cwd(), "public/Bunchify_Typo_White.svg")),
      readFile(join(process.cwd(), "public/spotify-mark.svg")),
    ]);

    const body = await renderStory({
      kind: type === "artists" ? "ARTISTS" : "TRACKS",
      rangePhrase: RANGE_PHRASE[range],
      displayName: profile.displayName,
      primary,
      secondary,
      rows: storyRows(type, items),
      wordmark: dataUrl(wordmark, "image/svg+xml"),
      spotifyMark: dataUrl(spotifyMark, "image/svg+xml"),
      font,
    });
    return new Response(body, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof SpotifyError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error(error);
    return Response.json({ error: "Could not make your story." }, { status: 500 });
  }
}
