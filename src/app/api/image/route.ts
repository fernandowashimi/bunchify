import { cookies } from "next/headers";
import { spotifyEnv } from "@/lib/env";
import { present } from "@/lib/session";
import { allowedStoryImageUrl } from "@/lib/story-image-url";

export const runtime = "nodejs";

const MAX_BYTES = 4_000_000;

export async function GET(request: Request) {
  const jar = await cookies();
  if (!present(jar)) {
    return Response.json({ error: "Session missing." }, { status: 401 });
  }

  const raw = new URL(request.url).searchParams.get("url");
  if (!raw) return Response.json({ error: "Invalid image." }, { status: 400 });

  let api: string;
  try {
    api = spotifyEnv().api;
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not load image." }, { status: 500 });
  }

  const target = allowedStoryImageUrl(raw, api);
  if (!target) return Response.json({ error: "Invalid image." }, { status: 400 });

  try {
    const response = await fetch(target, { redirect: "follow", cache: "no-store" });
    const type = (response.headers.get("content-type") ?? "").split(";")[0]?.trim().toLowerCase() ?? "";
    if (!response.ok || !type.startsWith("image/") || !allowedStoryImageUrl(response.url, api)) {
      return Response.json({ error: "Could not load image." }, { status: 502 });
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length === 0 || bytes.length > MAX_BYTES) {
      return Response.json({ error: "Could not load image." }, { status: 502 });
    }

    return new Response(bytes, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not load image." }, { status: 502 });
  }
}
