import { STORY_HEIGHT, STORY_WIDTH, StoryImage, storyRows } from "@/lib/story";
import { storyFontOptions, type StoryFontSet } from "@/lib/story-fonts";

type FontPayload = { syne: string; dmSans: string; numbers: string };

let fontsPromise: Promise<StoryFontSet> | null = null;
let logoPromise: Promise<string> | null = null;
const imagePromises = new Map<string, Promise<string>>();

function decodeBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not make your story."));
    reader.readAsDataURL(blob);
  });
}

async function readOk(response: Response) {
  if (response.status === 401) throw new Error("unauthorized");
  if (!response.ok) throw new Error("Could not make your story.");
  return response;
}

function loadPreviewFonts() {
  fontsPromise ??= fetch("/api/story-fonts")
    .then(readOk)
    .then((response) => response.json() as Promise<FontPayload>)
    .then((payload) => ({
      syne: decodeBase64(payload.syne),
      dmSans: decodeBase64(payload.dmSans),
      numbers: decodeBase64(payload.numbers),
    }))
    .catch((error: unknown) => {
      fontsPromise = null;
      throw error;
    });
  return fontsPromise;
}

function loadLogo() {
  logoPromise ??= fetch("/spotify-logo-white.png")
    .then(readOk)
    .then((response) => response.blob())
    .then(blobToDataUrl)
    .catch((error: unknown) => {
      logoPromise = null;
      throw error;
    });
  return logoPromise;
}

function embedImage(url: string) {
  const cached = imagePromises.get(url);
  if (cached) return cached;
  const pending = fetch(`/api/image?url=${encodeURIComponent(url)}`)
    .then(readOk)
    .then((response) => response.blob())
    .then(blobToDataUrl)
    .catch((error: unknown) => {
      imagePromises.delete(url);
      throw error;
    });
  imagePromises.set(url, pending);
  return pending;
}

async function embedAll(urls: Array<string | null>) {
  const unique = [...new Set(urls.filter((url): url is string => Boolean(url)))];
  const entries = await Promise.all(unique.map(async (url) => [url, await embedImage(url)] as const));
  return new Map(entries);
}

export async function renderStoryPreview(input: {
  kind: "ARTISTS" | "TRACKS";
  rangePhrase: string;
  displayName: string;
  primary: string;
  secondary: string;
  rows: ReturnType<typeof storyRows>;
  avatar: string | null;
}) {
  const [{ default: satori }, fonts, logo, embedded] = await Promise.all([
    import("satori"),
    loadPreviewFonts(),
    loadLogo(),
    embedAll([input.avatar, ...input.rows.map((row) => row.image)]),
  ]);

  return satori(
    <StoryImage
      kind={input.kind}
      rangePhrase={input.rangePhrase}
      displayName={input.displayName}
      primary={input.primary}
      secondary={input.secondary}
      rows={input.rows.map((row) => ({
        ...row,
        image: row.image ? (embedded.get(row.image) ?? null) : null,
      }))}
      spotifyLogo={logo}
      avatar={input.avatar ? (embedded.get(input.avatar) ?? null) : null}
    />,
    {
      width: STORY_WIDTH,
      height: STORY_HEIGHT,
      fonts: storyFontOptions(fonts),
    },
  );
}
