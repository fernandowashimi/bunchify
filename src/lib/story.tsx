import type { TopItem, TopType } from "@/lib/spotify";
import { storyImage } from "@/lib/spotify";

export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;

const SAFE_TOP = 269;
const SAFE_BOTTOM = 384;
const SAFE_SIDE = 65;
const INNER_HEIGHT = STORY_HEIGHT - SAFE_TOP - SAFE_BOTTOM;
const CONTENT_WIDTH = STORY_WIDTH - SAFE_SIDE * 2;

const HEADER_HEIGHT = 84;
const SPOTIFY_LOGO_WIDTH = 204;
const SPOTIFY_LOGO_HEIGHT = 56;
const GAP_AFTER_NAME = 36;
const TITLE_HEIGHT = 200;
const GAP_AFTER_TITLE = 40;
const ROW_SLOT = 164;
const ROW_CARD = 148;
const COVER = 108;
const RANK_WIDTH = 168;
const CARD_PAD_X = 18;
const RANK_INSET = 18;
const TEXT_GAP = 16;
const TEXT_WIDTH = CONTENT_WIDTH - CARD_PAD_X * 2 - RANK_INSET - COVER - TEXT_GAP - RANK_WIDTH;
const FOOTER_HEIGHT =
  INNER_HEIGHT - HEADER_HEIGHT - GAP_AFTER_NAME - TITLE_HEIGHT - GAP_AFTER_TITLE - ROW_SLOT * 5;

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
  displayName,
  primary,
  secondary,
  rows,
  spotifyLogo,
  avatar,
}: {
  kind: "ARTISTS" | "TRACKS";
  rangePhrase: string;
  displayName: string;
  primary: string;
  secondary: string;
  rows: StoryRow[];
  spotifyLogo: string;
  avatar: string | null;
}) {
  const kindSize = kind.length > 6 ? 100 : 118;

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
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {avatar ? (
              <img
                src={avatar}
                width={68}
                height={68}
                alt=""
                style={{ borderRadius: 34, objectFit: "cover", marginRight: 16 }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  width: 68,
                  height: 68,
                  borderRadius: 34,
                  marginRight: 16,
                  background: "rgba(255,255,255,0.16)",
                }}
              />
            )}
            <div style={clip(CONTENT_WIDTH - 68 - 16 - SPOTIFY_LOGO_WIDTH - 32, 34, "#ffffff")}>{displayName}</div>
          </div>
          <img src={spotifyLogo} width={SPOTIFY_LOGO_WIDTH} height={SPOTIFY_LOGO_HEIGHT} alt="" />
        </div>
        <div style={{ display: "flex", height: GAP_AFTER_NAME, flexShrink: 0 }} />
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
              fontSize: 34,
              lineHeight: "34px",
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
              marginTop: 6,
            }}
          >
            {kind}
          </div>
          <div
            style={{
              display: "flex",
              color: primary,
              fontSize: 26,
              lineHeight: "26px",
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
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: 22,
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
                    style={{ borderRadius: 16, objectFit: "cover", marginRight: TEXT_GAP }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      width: COVER,
                      height: COVER,
                      borderRadius: 16,
                      marginRight: TEXT_GAP,
                      background: "rgba(255,255,255,0.12)",
                    }}
                  />
                )}
                <div style={{ display: "flex", flexDirection: "column", width: TEXT_WIDTH }}>
                  <div style={clip(TEXT_WIDTH, 32, "#ffffff")}>{row.name}</div>
                  {row.artist ? (
                    <div style={{ ...clip(TEXT_WIDTH, 24, primary), marginTop: 6 }}>{row.artist}</div>
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
                    fontSize: 80,
                    lineHeight: "80px",
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
