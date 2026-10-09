import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { HEX_COLOR, INSUFFICIENT_TOP, RANGE_PHRASE } from "@/lib/story-copy";
import { loadGoogleFont } from "@/lib/story-fonts";
import { STORY_HEIGHT, STORY_WIDTH, StoryImage, storyRows } from "@/lib/story";
import { getProfile, getTop, isTopRange, isTopType, SpotifyError, storyImage } from "@/lib/spotify";

export const runtime = "nodejs";

let fontsPromise: Promise<{ syne: ArrayBuffer; dmSans: ArrayBuffer; numbers: ArrayBuffer }> | null = null;

function storyFonts() {
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
  spotifyLogo: string;
  avatar: string | null;
  syne: ArrayBuffer;
  dmSans: ArrayBuffer;
  numbers: ArrayBuffer;
}) {
  const image = new ImageResponse(
    <StoryImage
      kind={input.kind}
      rangePhrase={input.rangePhrase}
      displayName={input.displayName}
      primary={input.primary}
      secondary={input.secondary}
      rows={input.rows}
      spotifyLogo={input.spotifyLogo}
      avatar={input.avatar}
    />,
    {
      width: STORY_WIDTH,
      height: STORY_HEIGHT,
      fonts: [
        { name: "Syne", data: input.syne, weight: 800, style: "normal" },
        { name: "DM Sans", data: input.dmSans, weight: 500, style: "normal" },
        { name: "Instrument Serif", data: input.numbers, weight: 400, style: "italic" },
      ],
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

    const [{ syne, dmSans, numbers }, spotifyLogo] = await Promise.all([
      storyFonts(),
      readFile(join(process.cwd(), "public/spotify-logo-white.png")),
    ]);

    const body = await renderStory({
      kind: type === "artists" ? "ARTISTS" : "TRACKS",
      rangePhrase: RANGE_PHRASE[range],
      displayName: profile.displayName,
      primary,
      secondary,
      rows: storyRows(type, items),
      spotifyLogo: dataUrl(spotifyLogo, "image/png"),
      avatar: storyImage(profile.images),
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
