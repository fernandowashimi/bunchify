import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { HEX_COLOR, INSUFFICIENT_TOP, RANGE_PHRASE } from "@/lib/story-copy";
import { storyFontOptions, storyFonts } from "@/lib/story-fonts";
import { STORY_HEIGHT, STORY_WIDTH, StoryImage, storyRows } from "@/lib/story";
import { getTop, isTopRange, isTopType, SpotifyError } from "@/lib/spotify";

export const runtime = "nodejs";

function dataUrl(bytes: Buffer, mime: string) {
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

async function renderStory(input: {
  kind: "ARTISTS" | "TRACKS";
  rangePhrase: string;
  primary: string;
  secondary: string;
  rows: ReturnType<typeof storyRows>;
  spotifyLogo: string;
  syne: ArrayBuffer;
  dmSans: ArrayBuffer;
  numbers: ArrayBuffer;
}) {
  const image = new ImageResponse(
    <StoryImage
      kind={input.kind}
      rangePhrase={input.rangePhrase}
      primary={input.primary}
      secondary={input.secondary}
      rows={input.rows}
      spotifyLogo={input.spotifyLogo}
    />,
    {
      width: STORY_WIDTH,
      height: STORY_HEIGHT,
      fonts: storyFontOptions({ syne: input.syne, dmSans: input.dmSans, numbers: input.numbers }),
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
    const items = await getTop(type, range);
    if (items.length < 5) {
      return Response.json({ error: INSUFFICIENT_TOP }, { status: 422 });
    }

    const [{ syne, dmSans, numbers }, spotifyLogo] = await Promise.all([
      storyFonts(),
      readFile(join(process.cwd(), "public/spotify-logo-white.png")),
    ]);

    const body = await renderStory({
      kind: type === "artists" ? "ARTISTS" : "TRACKS",
      rangePhrase: RANGE_PHRASE[range],
      primary,
      secondary,
      rows: storyRows(type, items),
      spotifyLogo: dataUrl(spotifyLogo, "image/png"),
      syne,
      dmSans,
      numbers,
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
