import type { TopItem, TopType } from "@/lib/spotify";
import { storyImage } from "@/lib/spotify";

type StoryRow = {
  rank: string;
  name: string;
  artist?: string;
  image: string | null;
};

export function storyRows(type: TopType, items: TopItem[]): StoryRow[] {
  return items.slice(0, 5).map((item, index) => ({
    rank: String(index + 1),
    name: item.name,
    artist: type === "tracks" ? item.artist : undefined,
    image: storyImage(item.images),
  }));
}

export function StoryImage({
  kind,
  rangePhrase,
  displayName,
  primary,
  secondary,
  rows,
  wordmark,
  spotifyMark,
}: {
  kind: "ARTISTS" | "TRACKS";
  rangePhrase: string;
  displayName: string;
  primary: string;
  secondary: string;
  rows: StoryRow[];
  wordmark: string;
  spotifyMark: string;
}) {
  return (
    <div
      style={{
        width: "828px",
        height: "1792px",
        display: "flex",
        flexDirection: "column",
        background: primary,
        fontFamily: "Roboto Mono",
        padding: "36px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <img src={wordmark} width={280} height={52} alt="" />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          background: "#181818",
          marginTop: "28px",
          padding: "36px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", color: "#ffffff", fontSize: "32px" }}>{displayName}</div>
          <img src={spotifyMark} width={48} height={48} alt="" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "28px" }}>
          <div style={{ display: "flex", color: primary, fontSize: "40px" }}>Your Top</div>
          <div style={{ display: "flex", color: secondary, fontSize: "72px" }}>{kind}</div>
          <div style={{ display: "flex", color: primary, fontSize: "28px" }}>{rangePhrase}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "36px" }}>
          {rows.map((row) => (
            <div
              key={row.rank}
              style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}
            >
              <div style={{ display: "flex", color: secondary, fontSize: "36px", width: "56px" }}>
                {row.rank}
              </div>
              {row.image ? (
                <img
                  src={row.image}
                  width={120}
                  height={120}
                  alt=""
                  style={{ marginRight: "20px", objectFit: "cover" }}
                />
              ) : null}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", color: secondary, fontSize: "28px" }}>{row.name}</div>
                {row.artist ? (
                  <div style={{ display: "flex", color: primary, fontSize: "22px" }}>{row.artist}</div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
