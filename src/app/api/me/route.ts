import { getProfile, SpotifyError } from "@/lib/spotify";

export async function GET() {
  try {
    return Response.json(await getProfile());
  } catch (error) {
    if (error instanceof SpotifyError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    return Response.json({ error: "Could not load your profile." }, { status: 502 });
  }
}
