"use client";

import { useQuery } from "@tanstack/react-query";
import { OctagonXIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Atmosphere } from "@/components/atmosphere";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { INSUFFICIENT_TOP, RANGE_HELP } from "@/lib/story-copy";
import type { TopRange, TopType } from "@/lib/spotify";

const DEFAULT_PRIMARY = "#EE1F9D";
const DEFAULT_SECONDARY = "#DBFA84";

type TopResponse = { items: unknown[] };
type StoryRequest = {
  id: number;
  type: TopType;
  range: TopRange;
  primary: string;
  secondary: string;
};

async function readJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (response.status === 401) throw new Error("unauthorized");
  if (!response.ok) throw new Error("request failed");
  return response.json() as Promise<T>;
}

async function loadStory(request: StoryRequest) {
  const notice = toast.add({ title: "Making your story…", type: "loading" });
  const params = new URLSearchParams({
    type: request.type,
    range: request.range,
    primary: request.primary,
    secondary: request.secondary,
  });
  const response = await fetch(`/api/story?${params}`);

  if (response.status === 401) {
    toast.close(notice);
    throw new Error("unauthorized");
  }
  if (response.status === 422) {
    toast.update(notice, { title: INSUFFICIENT_TOP, type: "error" });
    throw new Error("insufficient");
  }
  if (!response.ok) {
    toast.update(notice, { title: "Could not make your story.", type: "error" });
    throw new Error("story failed");
  }

  const blob = await response.blob();
  toast.update(notice, { title: "Story ready", type: "success" });
  return { url: URL.createObjectURL(blob), blob };
}

function StoryPreviewStatus({ tone, children }: { tone: "waiting" | "failed"; children: string }) {
  return (
    <p className="flex size-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-muted-foreground">
      {tone === "failed" ? <OctagonXIcon className="size-5 text-destructive" aria-hidden="true" /> : null}
      {children}
    </p>
  );
}

export function HomeScreen() {
  const router = useRouter();
  const [type, setType] = useState<TopType | null>(null);
  const [range, setRange] = useState<TopRange | null>(null);
  const [primary, setPrimary] = useState(DEFAULT_PRIMARY);
  const [secondary, setSecondary] = useState(DEFAULT_SECONDARY);
  const [request, setRequest] = useState<StoryRequest | null>(null);
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null);
  const warned = useRef<string | null>(null);

  const top = useQuery({
    queryKey: ["top", type, range],
    enabled: type !== null && range !== null,
    queryFn: () => {
      if (!type || !range) throw new Error("missing top");
      return readJson<TopResponse>(`/api/top?type=${type}&range=${range}`);
    },
  });

  const storyRequest = request;
  const story = useQuery({
    queryKey: ["story", storyRequest],
    enabled: storyRequest !== null,
    queryFn: () => loadStory(storyRequest!),
  });

  useEffect(() => {
    if (top.error?.message === "unauthorized" || story.error?.message === "unauthorized") {
      router.push("/authorize");
    }
  }, [top.error, story.error, router]);

  useEffect(() => {
    if (top.isError && top.error?.message !== "unauthorized") {
      toast.add({ title: "Could not load your top.", type: "error" });
    }
  }, [top.isError, top.error]);

  useEffect(() => {
    if (!type || !range || !top.data || top.data.items.length >= 5) return;
    const key = `${type}:${range}`;
    if (warned.current === key) return;
    warned.current = key;
    toast.add({ title: INSUFFICIENT_TOP, type: "error" });
  }, [top.data, type, range]);

  function generate() {
    if (!type || !range) return;
    if (top.isError) {
      toast.add({ title: "Could not load your top.", type: "error" });
      return;
    }
    if ((top.data?.items.length ?? 0) < 5) {
      toast.add({ title: INSUFFICIENT_TOP, type: "error" });
      return;
    }
    setRequest({ id: Date.now(), type, range, primary, secondary });
  }

  function save() {
    if (!story.data) return;
    const anchor = document.createElement("a");
    anchor.href = story.data.url;
    anchor.download = "bunchify_image.png";
    anchor.click();
    toast.add({ title: "Saved bunchify_image.png", type: "success" });
  }

  const loadingTop = top.isFetching;
  const storyUrl = story.data?.url ?? null;
  const imageBroken = storyUrl !== null && brokenUrl === storyUrl;
  const showImage = storyUrl !== null && !imageBroken;
  const showSkeleton = story.isFetching;
  const insufficientTop = Boolean(type && range && top.data && top.data.items.length < 5);
  const readyToGenerate = Boolean(type && range);
  const previewStatus: { tone: "waiting" | "failed"; text: string } = imageBroken
    ? { tone: "failed", text: "Could not show your story." }
    : insufficientTop || story.error?.message === "insufficient"
      ? { tone: "failed", text: INSUFFICIENT_TOP }
      : story.isError
        ? { tone: "failed", text: "Could not make your story." }
        : top.isError
          ? { tone: "failed", text: "Could not load your top." }
          : { tone: "waiting", text: "Generate a story to preview it." };

  return (
    <Atmosphere>
      <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col items-center gap-6 px-5 py-8 min-[900px]:flex-row min-[900px]:justify-center">
        <div className="flex w-full max-w-[320px] justify-center">
          <div
            role="region"
            aria-label="Story preview"
            aria-busy={showSkeleton}
            className="aspect-[9/16] w-full overflow-hidden rounded-[18px] bg-black/40"
          >
            {showSkeleton ? (
              <Skeleton className="size-full rounded-[18px]" />
            ) : showImage ? (
              <img
                key={storyUrl}
                src={storyUrl}
                alt="Story preview"
                className="story-arrive size-full object-cover"
                onError={() => setBrokenUrl(storyUrl)}
              />
            ) : (
              <StoryPreviewStatus tone={previewStatus.tone}>{previewStatus.text}</StoryPreviewStatus>
            )}
          </div>
        </div>
        <aside className="w-full max-w-[420px] rounded-[20px] border bg-card p-4 min-[900px]:max-w-[280px]">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel>Type</FieldLabel>
                <ToggleGroup
                  value={type ? [type] : []}
                  onValueChange={(groupValue) => {
                    const next = groupValue[0];
                    if (next === "artists" || next === "tracks") setType(next);
                    else setType(null);
                  }}
                  className="w-full"
                >
                  <ToggleGroupItem value="artists">Top artists</ToggleGroupItem>
                  <ToggleGroupItem value="tracks">Top tracks</ToggleGroupItem>
                </ToggleGroup>
              </Field>
              <Field>
                <FieldLabel>Range</FieldLabel>
                <ToggleGroup
                  value={range ? [range] : []}
                  onValueChange={(groupValue) => {
                    const next = groupValue[0];
                    if (next === "short_term" || next === "medium_term" || next === "long_term") {
                      setRange(next);
                    } else setRange(null);
                  }}
                  className="flex w-full flex-col"
                >
                  <ToggleGroupItem value="short_term">Short term</ToggleGroupItem>
                  <ToggleGroupItem value="medium_term">Medium term</ToggleGroupItem>
                  <ToggleGroupItem value="long_term">Long term</ToggleGroupItem>
                </ToggleGroup>
                {range ? <FieldDescription>{RANGE_HELP[range]}</FieldDescription> : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="primary">Primary</FieldLabel>
                <input
                  id="primary"
                  type="color"
                  value={primary}
                  onChange={(event) => setPrimary(event.target.value)}
                  className="h-10 w-full cursor-pointer rounded-md border bg-transparent"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="secondary">Secondary</FieldLabel>
                <input
                  id="secondary"
                  type="color"
                  value={secondary}
                  onChange={(event) => setSecondary(event.target.value)}
                  className="h-10 w-full cursor-pointer rounded-md border bg-transparent"
                />
                <FieldDescription>Darker colors can be hard to read.</FieldDescription>
              </Field>
              <div className="flex flex-col gap-2">
                <Button onClick={generate} disabled={!readyToGenerate || story.isFetching || loadingTop}>
                  {story.isFetching ? "Making your story…" : "Generate"}
                </Button>
                <Button variant="outline" onClick={save} disabled={!story.data}>
                  Save image
                </Button>
                <Button variant="ghost" render={<a href="/api/auth/logout" />} nativeButton={false}>
                  Log out
                </Button>
              </div>
            </FieldGroup>
          </FieldSet>
        </aside>
      </main>
    </Atmosphere>
  );
}
