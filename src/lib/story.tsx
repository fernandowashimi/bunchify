import type { TopItem, TopType } from "@/lib/spotify";

type StoryArt = { url?: string; width?: number; height?: number };

export function storyImage(images: StoryArt[] | undefined) {
  const list = images ?? [];
  const mid = list[1]?.url;
  if (mid) return mid;
  const largest = [...list]
    .filter((image) => image.url)
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0];
  return largest?.url ?? null;
}

export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;

const SAFE_TOP = 269;
const SAFE_BOTTOM = 384;
const SAFE_SIDE = 56;
const INNER_HEIGHT = STORY_HEIGHT - SAFE_TOP - SAFE_BOTTOM;
const CONTENT_WIDTH = STORY_WIDTH - SAFE_SIDE * 2;

const HEADER_HEIGHT = 76;
const SPOTIFY_LOGO_WIDTH = 204;
const SPOTIFY_LOGO_HEIGHT = 56;
const GAP_AFTER_HEADER = 20;
const TITLE_HEIGHT = 176;
const GAP_AFTER_TITLE = 24;
const ROW_SLOT = 186;
const ROW_CARD = 170;
const COVER = 128;
const RANK_WIDTH = 156;
const CARD_PAD_X = 22;
const RANK_INSET = 14;
const TEXT_GAP = 22;
const TEXT_WIDTH = CONTENT_WIDTH - CARD_PAD_X * 2 - RANK_INSET - COVER - TEXT_GAP - RANK_WIDTH;
const FOOTER_HEIGHT =
  INNER_HEIGHT - HEADER_HEIGHT - GAP_AFTER_HEADER - TITLE_HEIGHT - GAP_AFTER_TITLE - ROW_SLOT * 5;

const GRADIENT = "linear-gradient(180deg, #0E1E38 0%, #141C3A 34%, #2A2150 58%, #5A2870 80%, #7F2D79 100%)";

type StoryRow = {
  rank: string;
  name: string;
  artist?: string;
  image: string | null;
};

export function storyRows(type: TopType, items: TopItem[]): StoryRow[] {
  return items.slice(0, 5).map((item, index) => ({
    rank: String(index + 1).padStart(2, "0"),
    name: item.name,
    artist: type === "tracks" ? item.artist : undefined,
    image: storyImage(item.images),
  }));
}

function clip(width: number, fontSize: number, color: string) {
  return {
    display: "flex" as const,
    width,
    color,
    fontSize,
    lineHeight: `${fontSize}px`,
    overflow: "hidden" as const,
    whiteSpace: "nowrap" as const,
    textOverflow: "ellipsis" as const,
  };
}

export function StoryImage({
  kind,
  rangePhrase,
  primary,
  secondary,
  rows,
  spotifyLogo,
}: {
  kind: "ARTISTS" | "TRACKS";
  rangePhrase: string;
  primary: string;
  secondary: string;
  rows: StoryRow[];
  spotifyLogo: string;
}) {
  const kindSize = kind.length > 6 ? 96 : 112;

  return (
    <div
      style={{
        width: STORY_WIDTH,
        height: STORY_HEIGHT,
        display: "flex",
        flexDirection: "column",
        background: GRADIENT,
        fontFamily: "DM Sans",
      }}
    >
      <div style={{ display: "flex", width: STORY_WIDTH, height: SAFE_TOP, flexShrink: 0 }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: STORY_WIDTH,
          height: INNER_HEIGHT,
          flexShrink: 0,
          boxSizing: "border-box",
          paddingLeft: SAFE_SIDE,
          paddingRight: SAFE_SIDE,
        }}
      >
        <div
          style={{
            display: "flex",
            height: HEADER_HEIGHT,
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <img src={spotifyLogo} width={SPOTIFY_LOGO_WIDTH} height={SPOTIFY_LOGO_HEIGHT} alt="" />
        </div>
        <div style={{ display: "flex", height: GAP_AFTER_HEADER, flexShrink: 0 }} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: TITLE_HEIGHT,
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              color: primary,
              fontSize: 32,
              lineHeight: "32px",
              letterSpacing: 5,
              textTransform: "uppercase",
            }}
          >
            Your Top
          </div>
          <div
            style={{
              display: "flex",
              color: secondary,
              fontFamily: "Syne",
              fontSize: kindSize,
              fontWeight: 800,
              lineHeight: `${kindSize}px`,
              marginTop: 4,
            }}
          >
            {kind}
          </div>
          <div
            style={{
              display: "flex",
              color: primary,
              fontSize: 24,
              lineHeight: "24px",
              letterSpacing: 3,
              textTransform: "uppercase",
              marginTop: 8,
            }}
          >
            {rangePhrase}
          </div>
        </div>
        <div style={{ display: "flex", height: GAP_AFTER_TITLE, flexShrink: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", height: ROW_SLOT * 5, flexShrink: 0 }}>
          {rows.map((row) => (
            <div
              key={row.rank}
              style={{ display: "flex", height: ROW_SLOT, alignItems: "center", flexShrink: 0 }}
            >
              <div
                style={{
                  display: "flex",
                  width: CONTENT_WIDTH,
                  height: ROW_CARD,
                  alignItems: "center",
                  boxSizing: "border-box",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: 24,
                  paddingLeft: CARD_PAD_X,
                  paddingRight: CARD_PAD_X + RANK_INSET,
                }}
              >
                {row.image ? (
                  <img
                    src={row.image}
                    width={COVER}
                    height={COVER}
                    alt=""
                    style={{ borderRadius: 18, objectFit: "cover", marginRight: TEXT_GAP }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      width: COVER,
                      height: COVER,
                      borderRadius: 18,
                      marginRight: TEXT_GAP,
                      background: "rgba(255,255,255,0.12)",
                    }}
                  />
                )}
                <div style={{ display: "flex", flexDirection: "column", width: TEXT_WIDTH }}>
                  <div style={clip(TEXT_WIDTH, 38, "#ffffff")}>{row.name}</div>
                  {row.artist ? (
                    <div style={{ ...clip(TEXT_WIDTH, 28, primary), marginTop: 8 }}>{row.artist}</div>
                  ) : null}
                </div>
                <div
                  style={{
                    display: "flex",
                    width: RANK_WIDTH,
                    justifyContent: "flex-end",
                    color: "#ffffff",
                    fontFamily: "Instrument Serif",
                    fontStyle: "italic",
                    fontWeight: 400,
                    fontSize: 92,
                    lineHeight: "92px",
                  }}
                >
                  {row.rank}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            height: FOOTER_HEIGHT,
            flexShrink: 0,
            justifyContent: "center",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              color: "rgba(255,255,255,0.82)",
              fontSize: 26,
              lineHeight: "26px",
            }}
          >
            made using bunchify.vercel.app
          </div>
        </div>
      </div>
      <div style={{ display: "flex", width: STORY_WIDTH, height: SAFE_BOTTOM, flexShrink: 0 }} />
    </div>
  );
}
