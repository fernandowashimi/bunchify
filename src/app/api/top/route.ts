import { getTop, isTopRange, isTopType, SpotifyError } from "@/lib/spotify";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const range = url.searchParams.get("range");

  if (!isTopType(type) || !isTopRange(range)) {
    return Response.json({ error: "Invalid top." }, { status: 400 });
  }

  try {
    const items = await getTop(type, range);
    return Response.json({ items });
  } catch (error) {
    if (error instanceof SpotifyError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    return Response.json({ error: "Could not load your top." }, { status: 502 });
  }
}
