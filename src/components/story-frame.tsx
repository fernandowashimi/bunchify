"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { STORY_HEIGHT, STORY_WIDTH } from "@/lib/story";

export function StoryFrame({ svg }: { svg: string }) {
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
    <div ref={frame} className="story-arrive relative size-full overflow-hidden" role="img" aria-label="Story preview">
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
    </div>
  );
}
