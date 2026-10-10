"use client";

import { HeartIcon, SendIcon } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { STORY_HEIGHT, STORY_WIDTH } from "@/lib/story";

function proxiedImage(url: string) {
  return `/api/image?url=${encodeURIComponent(url)}`;
}

function VerifiedBadge({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="#3897F0" />
      <path
        d="M11.2 5.55 6.95 10.05 4.8 7.9"
        stroke="#fff"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Equalizer({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      <rect className="story-eq-bar" x="1" y="3" width="2" height="8" rx="0.6" />
      <rect className="story-eq-bar" x="5" y="1" width="2" height="10" rx="0.6" />
      <rect className="story-eq-bar" x="9" y="4" width="2" height="7" rx="0.6" />
    </svg>
  );
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="19" cy="12" r="1.7" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function StoryChrome({
  displayName,
  avatarUrl,
  sticker,
}: {
  displayName: string;
  avatarUrl: string | null;
  sticker: string | null;
}) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 font-sans text-white">
      <div className="absolute inset-x-0 top-0 h-[14%] bg-gradient-to-b from-black/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[14%] bg-gradient-to-t from-black/40 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-between px-[3.2%] pt-[1.8%] pb-[2.4%]">
        <div className="flex flex-col gap-[2.4cqw]">
          <div className="flex gap-[0.55cqw]">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-[0.5cqw] min-h-[2px] flex-1 overflow-hidden rounded-full bg-white/40">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: index === 0 ? "100%" : index === 1 ? "55%" : "0%" }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-start justify-between gap-[2cqw]">
            <div className="flex min-w-0 flex-1 items-start gap-[2cqw]">
              {avatarUrl ? (
                <img
                  src={proxiedImage(avatarUrl)}
                  alt=""
                  className="mt-[0.2cqw] size-[8.2cqw] shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="mt-[0.2cqw] size-[8.2cqw] shrink-0 rounded-full bg-white/25" />
              )}
              <div
                className="flex min-w-0 flex-1 flex-col gap-[1cqw] pt-[0.4cqw]"
                style={{ textShadow: "0 0.5px 1.5px rgba(0,0,0,0.35)" }}
              >
                <div className="flex min-w-0 items-center gap-[1.1cqw]">
                  <span className="truncate text-[3.15cqw] font-semibold leading-none tracking-[-0.01em]">
                    {displayName}
                  </span>
                  <VerifiedBadge className="size-[3.4cqw] shrink-0" />
                  <span className="shrink-0 text-[3cqw] leading-none text-white/65">1 d</span>
                </div>
                {sticker ? (
                  <div className="flex min-w-0 items-center gap-[1cqw] text-[2.7cqw] leading-none text-white/95">
                    <Equalizer className="size-[2.8cqw] shrink-0" />
                    <span className="truncate">{sticker}</span>
                    <span className="shrink-0 text-white/80">›</span>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-[3.2cqw] pt-[0.8cqw]">
              <MoreIcon className="size-[5.2cqw]" />
              <CloseIcon className="size-[5.6cqw]" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-[4cqw]">
          <div
            className="flex min-h-0 flex-1 items-center rounded-full border border-white/90 px-[4.2cqw] py-[2.6cqw] text-[3.1cqw] leading-none font-normal text-white/70"
            style={{ textShadow: "0 0.5px 1.5px rgba(0,0,0,0.35)" }}
          >
            Send message...
          </div>
          <HeartIcon className="size-[6.6cqw] shrink-0" strokeWidth={1.75} />
          <SendIcon className="size-[6.6cqw] shrink-0" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}

export function StoryFrame({
  svg,
  displayName,
  avatarUrl,
  sticker,
}: {
  svg: string;
  displayName: string;
  avatarUrl: string | null;
  sticker: string | null;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const node = frame.current;
    if (!node) return;
    const measure = () => {
      const width = node.clientWidth;
      if (width > 0) setScale(width / STORY_WIDTH);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frame}
      className="story-arrive relative size-full overflow-hidden [container-type:inline-size]"
      role="img"
      aria-label="Story preview"
    >
      <div
        className="story-frame absolute top-0 left-0"
        style={{
          width: STORY_WIDTH,
          height: STORY_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <StoryChrome displayName={displayName} avatarUrl={avatarUrl} sticker={sticker} />
    </div>
  );
}
