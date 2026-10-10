"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  DownloadIcon,
  ExternalLinkIcon,
  Loader2Icon,
  MusicIcon,
  OctagonXIcon,
  ShareIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Atmosphere } from "@/components/atmosphere";
import { StoryFrame } from "@/components/story-frame";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSet, FieldTitle } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { renderStoryPreview } from "@/lib/render-story-preview";
import { INSUFFICIENT_TOP, PREVIEW_EMPTY, RANGE_HELP, RANGE_PHRASE } from "@/lib/story-copy";
import { storyImage, storyRows } from "@/lib/story";
import type { ListenerProfile, TopItem, TopRange, TopType } from "@/lib/spotify";

const DEFAULT_PRIMARY = "#EE1F9D";
const DEFAULT_SECONDARY = "#DBFA84";
const COLOR_DELAY = 150;
const STORY_FILENAME = "bunchify_image.png";
const DESKTOP_MIN = 900;
// Handle + header chrome only. Pixel value avoids root font-size drift from rem.
const MOBILE_SNAP_PEEK = "88px";
const MOBILE_SNAP_EXPANDED = 0.92;
const MOBILE_SNAP_POINTS = [MOBILE_SNAP_PEEK, MOBILE_SNAP_EXPANDED] as const;
type MobileSnapPoint = (typeof MOBILE_SNAP_POINTS)[number];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${DESKTOP_MIN - 1}px)`);
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return isMobile;
}

function useLockMobileBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const html = document.documentElement;
    const { body } = document;
    const previousHtml = html.style.overflow;
    const previousBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = previousHtml;
      body.style.overflow = previousBody;
    };
  }, [locked]);
}

function downloadStory(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = STORY_FILENAME;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function shareCancelled(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

type TopResponse = { items: TopItem[] };
type PreviewRequest = { attempt: number; type: TopType; range: TopRange };
type PreviewStory = {
  svg: string;
  type: TopType;
  range: TopRange;
  primary: string;
  secondary: string;
  sticker: string | null;
};

function storySticker(item: TopItem | undefined) {
  if (!item) return null;
  return item.artist ? `${item.artist} · ${item.name}` : item.name;
}

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
    <p className="flex size-full flex-col items-center justify-center gap-3 whitespace-pre-line px-6 text-center text-sm text-muted-foreground">
      {tone === "failed" ? <OctagonXIcon className="size-5 text-destructive" aria-hidden="true" /> : null}
      {children}
    </p>
  );
}

type AttributionItem = { name: string; url: string };

type StoryControlsProps = {
  type: TopType | null;
  range: TopRange | null;
  primary: string;
  secondary: string;
  readyToGenerate: boolean;
  showSkeleton: boolean;
  loadingTop: boolean;
  storyActionReady: boolean;
  onTypeChange: (type: TopType | null) => void;
  onRangeChange: (range: TopRange | null) => void;
  onPrimaryChange: (primary: string) => void;
  onSecondaryChange: (secondary: string) => void;
  onGenerate: () => void;
  onShare: () => void;
  onSave: () => void;
};

function SpotifyAttribution({ items }: { items: AttributionItem[] }) {
  if (items.length === 0) return null;
  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          />
        }
      >
        Attribution
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attribution</DialogTitle>
          <DialogDescription>Content from Spotify. Listen on Spotify:</DialogDescription>
        </DialogHeader>
        <div role="region" aria-label="Spotify attribution" className="flex flex-col gap-3">
          <a
            href="https://open.spotify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center"
          >
            <img src="/spotify-logo-white.png" alt="Spotify" className="h-5 w-auto opacity-90" />
          </a>
          <ul className="flex flex-col gap-1.5">
            {items.map((item) => (
              <li key={item.url}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-foreground underline-offset-2 hover:underline"
                >
                  <span>{item.name}</span>
                  <ExternalLinkIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StoryControls({
  type,
  range,
  primary,
  secondary,
  readyToGenerate,
  showSkeleton,
  loadingTop,
  storyActionReady,
  onTypeChange,
  onRangeChange,
  onPrimaryChange,
  onSecondaryChange,
  onGenerate,
  onShare,
  onSave,
}: StoryControlsProps) {
  const id = useId();
  const rangeLabelId = `${id}-range`;
  const primaryId = `${id}-primary`;
  const secondaryId = `${id}-secondary`;

  return (
    <FieldSet>
      <FieldGroup>
        <Field>
          <FieldLabel>Type</FieldLabel>
          <ToggleGroup
            variant="segment"
            spacing={1}
            value={type ? [type] : []}
            onValueChange={(groupValue) => {
              const next = groupValue[0];
              if (next === "artists" || next === "tracks") onTypeChange(next);
              else onTypeChange(null);
            }}
          >
            <ToggleGroupItem value="artists">
              <UserIcon data-icon="inline-start" />
              Top artists
            </ToggleGroupItem>
            <ToggleGroupItem value="tracks">
              <MusicIcon data-icon="inline-start" />
              Top tracks
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>
        <Field>
          <FieldLabel id={rangeLabelId}>Range</FieldLabel>
          <RadioGroup
            aria-labelledby={rangeLabelId}
            value={range ?? ""}
            onValueChange={(next) => {
              if (next === "short_term" || next === "medium_term" || next === "long_term") {
                onRangeChange(next);
              }
            }}
          >
            <FieldLabel>
              <Field orientation="horizontal" className="items-center has-[>[data-slot=field-content]]:items-center">
                <RadioGroupItem value="short_term" />
                <FieldContent>
                  <FieldTitle>Short term</FieldTitle>
                  <FieldDescription>{RANGE_HELP.short_term}</FieldDescription>
                </FieldContent>
              </Field>
            </FieldLabel>
            <FieldLabel>
              <Field orientation="horizontal" className="items-center has-[>[data-slot=field-content]]:items-center">
                <RadioGroupItem value="medium_term" />
                <FieldContent>
                  <FieldTitle>Medium term</FieldTitle>
                  <FieldDescription>{RANGE_HELP.medium_term}</FieldDescription>
                </FieldContent>
              </Field>
            </FieldLabel>
            <FieldLabel>
              <Field orientation="horizontal" className="items-center has-[>[data-slot=field-content]]:items-center">
                <RadioGroupItem value="long_term" />
                <FieldContent>
                  <FieldTitle>Long term</FieldTitle>
                  <FieldDescription>{RANGE_HELP.long_term}</FieldDescription>
                </FieldContent>
              </Field>
            </FieldLabel>
          </RadioGroup>
        </Field>
        <Field>
          <FieldLabel htmlFor={primaryId}>Primary</FieldLabel>
          <input
            id={primaryId}
            type="color"
            value={primary}
            onChange={(event) => onPrimaryChange(event.target.value)}
            className="h-10 w-full cursor-pointer rounded-md border bg-transparent"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={secondaryId}>Secondary</FieldLabel>
          <input
            id={secondaryId}
            type="color"
            value={secondary}
            onChange={(event) => onSecondaryChange(event.target.value)}
            className="h-10 w-full cursor-pointer rounded-md border bg-transparent"
          />
          <FieldDescription>Darker colors can be hard to read.</FieldDescription>
        </Field>
        <div className="flex flex-col gap-2">
          <Button onClick={onGenerate} disabled={!readyToGenerate || showSkeleton || loadingTop}>
            {showSkeleton ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <SparklesIcon data-icon="inline-start" />
            )}
            {showSkeleton ? "Making your story…" : "Generate"}
          </Button>
          <Button variant="outline" onClick={onShare} disabled={!storyActionReady}>
            <ShareIcon data-icon="inline-start" />
            Share
          </Button>
          <Button variant="outline" onClick={onSave} disabled={!storyActionReady}>
            <DownloadIcon data-icon="inline-start" />
            Save image
          </Button>
          <Button variant="ghost" render={<a href="/api/auth/logout" />} nativeButton={false}>
            Log out
          </Button>
        </div>
      </FieldGroup>
    </FieldSet>
  );
}

export function HomeScreen() {
  const router = useRouter();
  const [type, setType] = useState<TopType | null>(null);
  const [range, setRange] = useState<TopRange | null>(null);
  const [primary, setPrimary] = useState(DEFAULT_PRIMARY);
  const [secondary, setSecondary] = useState(DEFAULT_SECONDARY);
  const [preview, setPreview] = useState<PreviewRequest | null>(null);
  const [snapPoint, setSnapPoint] = useState<MobileSnapPoint>(MOBILE_SNAP_PEEK);
  const isMobile = useIsMobile();
  useLockMobileBodyScroll(isMobile);
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
        primary: look.primary,
        secondary: look.secondary,
        rows: storyRows(previewRequest.type, previewItems.items),
      }).then((svg) => ({
        svg,
        type: previewRequest.type,
        range: previewRequest.range,
        primary: look.primary,
        secondary: look.secondary,
        sticker: storySticker(previewItems.items[0]),
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
    setSnapPoint(MOBILE_SNAP_PEEK);
  }

  async function storyPng() {
    const ready: PreviewStory | undefined = story.data;
    if (!ready || story.isFetching || story.isPlaceholderData) return null;
    const params = new URLSearchParams({
      type: ready.type,
      range: ready.range,
      primary: ready.primary,
      secondary: ready.secondary,
    });
    const response = await fetch(`/api/story?${params}`);
    if (response.status === 401) {
      router.push("/authorize");
      return null;
    }
    if (!response.ok) {
      toast.add({ title: "Could not make your story.", type: "error" });
      return null;
    }
    return response.blob();
  }

  async function save() {
    const blob = await storyPng();
    if (!blob) return;
    downloadStory(blob);
    toast.add({ title: `Saved ${STORY_FILENAME}`, type: "success" });
  }

  async function share() {
    const blob = await storyPng();
    if (!blob) return;
    const file = new File([blob], STORY_FILENAME, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Bunchify" });
        return;
      } catch (error) {
        if (shareCancelled(error)) return;
      }
    }
    downloadStory(blob);
    toast.add({ title: `Saved ${STORY_FILENAME}`, type: "success" });
  }

  const loadingTop = top.isFetching;
  const readyToGenerate = Boolean(type && range);
  const storyActionReady = Boolean(story.data) && !story.isFetching && !story.isPlaceholderData && !insufficientTop;
  const showSvg = Boolean(story.data) && !showSkeleton && !insufficientTop && !previewFailed && !top.isError;
  const previewStatus: { tone: "waiting" | "failed"; text: string } = insufficientTop
    ? { tone: "failed", text: INSUFFICIENT_TOP }
    : previewFailed
      ? { tone: "failed", text: "Could not make your story." }
      : top.isError
        ? { tone: "failed", text: "Could not load your top." }
        : { tone: "waiting", text: PREVIEW_EMPTY };

  const attribution: AttributionItem[] = (previewItems?.items ?? [])
    .filter((item): item is TopItem & { url: string } => Boolean(item.url))
    .map((item) => ({ name: item.name, url: item.url }));

  const controlProps: StoryControlsProps = {
    type,
    range,
    primary,
    secondary,
    readyToGenerate,
    showSkeleton,
    loadingTop,
    storyActionReady,
    onTypeChange: setType,
    onRangeChange: setRange,
    onPrimaryChange: setPrimary,
    onSecondaryChange: setSecondary,
    onGenerate: generate,
    onShare: share,
    onSave: save,
  };

  return (
    <Atmosphere>
      <main className="mx-auto flex h-svh w-full max-w-5xl flex-col items-center overflow-hidden px-5 pt-6 pb-[88px] min-[900px]:h-auto min-[900px]:min-h-svh min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-center min-[900px]:gap-6 min-[900px]:overflow-visible min-[900px]:py-8 min-[900px]:pb-8">
        <div className="flex min-h-0 w-full max-w-[400px] flex-1 flex-col items-center justify-center gap-2 min-[900px]:flex-none">
          <div
            role="region"
            aria-label="Story preview"
            aria-busy={showSkeleton}
            className="aspect-[9/16] min-h-0 w-auto max-w-full flex-1 overflow-hidden rounded-[18px] bg-black/40 min-[900px]:h-auto min-[900px]:w-full min-[900px]:flex-none"
          >
            {showSkeleton ? (
              <Skeleton className="size-full rounded-[18px]" />
            ) : showSvg && story.data ? (
              <StoryFrame
                svg={story.data.svg}
                displayName={profile.data?.displayName ?? ""}
                avatarUrl={storyImage(profile.data?.images)}
                sticker={story.data.sticker}
                stickerUrl={attribution[0]?.url ?? null}
              />
            ) : (
              <StoryPreviewStatus tone={previewStatus.tone}>{previewStatus.text}</StoryPreviewStatus>
            )}
          </div>
          <SpotifyAttribution items={attribution} />
        </div>
        <aside className="hidden w-full max-w-[280px] rounded-[20px] border bg-card p-4 min-[900px]:block">
          <div className="flex flex-col gap-0.5 pb-4">
            <h2 className="font-heading text-base font-medium text-foreground">Customize</h2>
            <p className="text-sm text-balance text-muted-foreground">Pick your top, range, and colors.</p>
          </div>
          <StoryControls {...controlProps} />
        </aside>
        {isMobile ? (
          <Drawer
            open
            onOpenChange={(next) => {
              if (!next) setSnapPoint(MOBILE_SNAP_PEEK);
            }}
            modal={false}
            disablePointerDismissal
            showSwipeHandle
            snapPoints={[...MOBILE_SNAP_POINTS]}
            snapPoint={snapPoint}
            onSnapPointChange={(next) => {
              if (next === MOBILE_SNAP_PEEK || next === MOBILE_SNAP_EXPANDED) {
                setSnapPoint(next);
              }
            }}
          >
            <DrawerContent initialFocus={false}>
              <DrawerHeader className="pb-3">
                <DrawerTitle>Customize</DrawerTitle>
                <DrawerDescription>Pick your top, range, and colors.</DrawerDescription>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto p-4 pt-0">
                <StoryControls {...controlProps} />
              </div>
            </DrawerContent>
          </Drawer>
        ) : null}
      </main>
    </Atmosphere>
  );
}
