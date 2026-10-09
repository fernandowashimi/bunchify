import { cookies } from "next/headers";
import { present } from "@/lib/session";
import { storyFonts } from "@/lib/story-fonts";

export const runtime = "nodejs";

function base64(bytes: ArrayBuffer) {
  return Buffer.from(bytes).toString("base64");
}

export async function GET() {
  const jar = await cookies();
  if (!present(jar)) {
    return Response.json({ error: "Session missing." }, { status: 401 });
  }

  try {
    const fonts = await storyFonts();
    return Response.json(
      {
        syne: base64(fonts.syne),
        dmSans: base64(fonts.dmSans),
        numbers: base64(fonts.numbers),
      },
      { headers: { "Cache-Control": "private, max-age=86400" } },
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not load fonts." }, { status: 502 });
  }
}
