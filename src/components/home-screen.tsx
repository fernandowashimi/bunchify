"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { OctagonXIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Atmosphere } from "@/components/atmosphere";
import { StoryFrame } from "@/components/story-frame";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { renderStoryPreview } from "@/lib/render-story-preview";
import { INSUFFICIENT_TOP, RANGE_HELP, RANGE_PHRASE } from "@/lib/story-copy";
import { storyImage, storyRows } from "@/lib/story";
import type { ListenerProfile, TopItem, TopRange, TopType } from "@/lib/spotify";

const DEFAULT_PRIMARY = "#EE1F9D";
const DEFAULT_SECONDARY = "#DBFA84";
const COLOR_DELAY = 150;

type TopResponse = { items: TopItem[] };
type PreviewRequest = { attempt: number; type: TopType; range: TopRange };
type PreviewStory = {
  svg: string;
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

function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
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
  const [preview, setPreview] = useState<PreviewRequest | null>(null);
  const warned = useRef<string | null>(null);
  const making = useRef<string | null>(null);
  const debouncedPrimary = useDebounced(primary, COLOR_DELAY);
  const debouncedSecondary = useDebounced(secondary, COLOR_DELAY);

  const top = useQuery({
    queryKey: ["top", type, range],
    enabled: type !== null && range !== null,
    queryFn: () => {
      if (!type || !range) throw new Error("missing top");
      return readJson<TopResponse>(`/api/top?type=${type}&range=${range}`);
    },
  });

  const profile = useQuery({
    queryKey: ["me"],
    enabled: preview !== null,
    staleTime: Infinity,
    retry: false,
    queryFn: () => readJson<ListenerProfile>("/api/me"),
  });

  const previewRequest = preview;
  const previewMatches =
    previewRequest !== null && type === previewRequest.type && range === previewRequest.range;
  const previewItems =
    previewMatches && top.data && top.data.items.length >= 5 && profile.data
      ? { items: top.data.items, profile: profile.data }
      : null;

  const story = useQuery({
    queryKey: [
      "story-preview",
      previewRequest?.attempt,
      previewRequest?.type,
      previewRequest?.range,
      debouncedPrimary,
      debouncedSecondary,
      previewItems?.profile.displayName,
      storyImage(previewItems?.profile.images),
      previewItems?.items.map((item) => `${item.name}\0${item.artist ?? ""}\0${storyImage(item.images) ?? ""}`).join("\n"),
    ],
    enabled: previewItems !== null,
    staleTime: Infinity,
    retry: false,
    placeholderData: keepPreviousData,
    queryFn: () => {
      if (!previewRequest || !previewItems) throw new Error("missing story");
      const look = { primary: debouncedPrimary, secondary: debouncedSecondary };
      return renderStoryPreview({
        kind: previewRequest.type === "artists" ? "ARTISTS" : "TRACKS",
        rangePhrase: RANGE_PHRASE[previewRequest.range],
        displayName: previewItems.profile.displayName,
        primary: look.primary,
        secondary: look.secondary,
        rows: storyRows(previewRequest.type, previewItems.items),
        avatar: storyImage(previewItems.profile.images),
      }).then((svg) => ({
        svg,
        type: previewRequest.type,
        range: previewRequest.range,
        primary: look.primary,
        secondary: look.secondary,
      }));
    },
  });

  useEffect(() => {
    if (
      top.error?.message === "unauthorized" ||
      profile.error?.message === "unauthorized" ||
      story.error?.message === "unauthorized"
    ) {
      router.push("/authorize");
    }
  }, [top.error, profile.error, story.error, router]);

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

  const insufficientTop = Boolean(type && range && top.data && top.data.items.length < 5);
  const previewFailed = story.isError || (previewMatches && profile.isError);
  const showSkeleton =
    previewMatches && !insufficientTop && !top.isError && !previewFailed && !story.data;

  useEffect(() => {
    if (showSkeleton) {
      if (making.current === null) {
        making.current = toast.add({ title: "Making your story…", type: "loading" });
      }
      return;
    }
    if (making.current === null) return;
    const notice = making.current;
    making.current = null;
    if (story.isSuccess) toast.update(notice, { title: "Story ready", type: "success" });
    else if (previewFailed) toast.update(notice, { title: "Could not make your story.", type: "error" });
    else toast.close(notice);
  }, [showSkeleton, story.isSuccess, previewFailed]);

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
    setPreview({ attempt: Date.now(), type, range });
  }

  async function save() {
    const ready: PreviewStory | undefined = story.data;
    if (!ready || story.isFetching || story.isPlaceholderData) return;
    const params = new URLSearchParams({
      type: ready.type,
      range: ready.range,
      primary: ready.primary,
      secondary: ready.secondary,
    });
    const response = await fetch(`/api/story?${params}`);
    if (response.status === 401) {
      router.push("/authorize");
      return;
    }
    if (!response.ok) {
      toast.add({ title: "Could not make your story.", type: "error" });
      return;
    }
    const url = URL.createObjectURL(await response.blob());
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "bunchify_image.png";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
    toast.add({ title: "Saved bunchify_image.png", type: "success" });
  }

  const loadingTop = top.isFetching;
  const readyToGenerate = Boolean(type && range);
  const showSvg = Boolean(story.data) && !showSkeleton && !insufficientTop && !previewFailed && !top.isError;
  const previewStatus: { tone: "waiting" | "failed"; text: string } = insufficientTop
    ? { tone: "failed", text: INSUFFICIENT_TOP }
    : previewFailed
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
            ) : showSvg && story.data ? (
              <StoryFrame svg={story.data.svg} />
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
                <Button onClick={generate} disabled={!readyToGenerate || showSkeleton || loadingTop}>
                  {showSkeleton ? "Making your story…" : "Generate"}
                </Button>
                <Button
                  variant="outline"
                  onClick={save}
                  disabled={!story.data || story.isFetching || story.isPlaceholderData || insufficientTop}
                >
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
