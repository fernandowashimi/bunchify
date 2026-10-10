import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

const stub = "http://127.0.0.1:4010";

test.beforeEach(async ({ request }) => {
  await request.post(`${stub}/__control`, { data: { mode: "ok" } });
});

async function connect(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Connect Spotify" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("button", { name: "Generate" })).toBeVisible();
}

async function spotifyReads(page: Page) {
  const recorded = await page.request.get(`${stub}/__requests`);
  const body = (await recorded.json()) as { requests: string[] };
  return body.requests;
}

async function generateStory(page: Page) {
  await page.getByRole("button", { name: "Top artists" }).click();
  await page.getByRole("radio", { name: "Short term" }).click();
  await page.getByRole("button", { name: "Generate" }).click();
  await expect(page.getByRole("img", { name: "Story preview" })).toBeVisible({ timeout: 30_000 });
}

test("logged-out home sends the listener to Authorize", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/authorize$/);
  await expect(page.getByRole("img", { name: "Bunchify" })).toBeVisible();
  await expect(page.getByText("Your Spotify tops, made for Stories.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Connect Spotify" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Spotify account" })).toHaveAttribute(
    "href",
    "https://www.spotify.com/account/apps/",
  );
  await expect(page.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
    "href",
    "https://www.spotify.com/legal/privacy-policy/",
  );
});

test("a stubbed Spotify callback opens Home without exposing the access token", async ({ page }) => {
  await connect(page);
  await expect(page.getByRole("button", { name: "Top artists" })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("radio", { name: "Short term" })).not.toBeChecked();
  await expect(page.getByLabel("Primary")).toHaveValue("#ee1f9d");
  await expect(page.getByLabel("Secondary")).toHaveValue("#dbfa84");
  await expect(page.getByRole("button", { name: "Generate" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Share" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Save image" })).toBeDisabled();
  await expect(page.getByRole("img", { name: "Story preview" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Story preview" }).locator("[data-slot=skeleton]")).toHaveCount(0);
  await expect(page.getByText("Your story will show up here.")).toBeVisible();
  await expect(page.getByText("Pick your top and choose a time range to start.")).toBeVisible();
  await page.waitForTimeout(1_000);
  expect((await spotifyReads(page)).filter((entry) => entry.includes("/v1/me"))).toEqual([]);

  const leaked = await page.evaluate(() => ({
    storage: JSON.stringify(localStorage),
    cookie: document.cookie,
    text: document.body.innerText,
  }));
  expect(leaked.storage).not.toContain("test-access-token");
  expect(leaked.cookie).not.toContain("test-access-token");
  expect(leaked.text).not.toContain("test-access-token");
});

test("the preview skeleton shows only while a story is generating", async ({ page }) => {
  await page.route("**/api/top**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await route.continue();
  });
  await page.route("**/api/me", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await route.continue();
  });
  await connect(page);
  const preview = page.getByRole("region", { name: "Story preview" });
  await expect(preview.locator("[data-slot=skeleton]")).toHaveCount(0);

  await page.getByRole("button", { name: "Top artists" }).click();
  await page.getByRole("radio", { name: "Short term" }).click();
  await expect(preview.locator("[data-slot=skeleton]")).toHaveCount(0);
  await expect(preview.getByText("Your story will show up here.")).toBeVisible();
  await expect(preview.getByText("Pick your top and choose a time range to start.")).toBeVisible();
  await expect(page.getByText("Loading your tops…")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Generate" })).toBeEnabled();
  await expect(preview.locator("[data-slot=skeleton]")).toHaveCount(0);

  await page.getByRole("button", { name: "Generate" }).click();
  await expect(preview.locator("[data-slot=skeleton]")).toBeVisible();
  await expect(preview.getByRole("img", { name: "Story preview" })).toBeVisible({ timeout: 30_000 });
  await expect(preview.locator("[data-slot=skeleton]")).toHaveCount(0);
});

test("changing the top and generating updates the story preview", async ({ page }) => {
  const storyRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/story") storyRequests.push(request.url());
  });
  await connect(page);
  await generateStory(page);
  const frame = page.getByRole("img", { name: "Story preview" }).locator(".story-frame");
  const before = await frame.innerHTML();
  expect(storyRequests).toEqual([]);

  await page.getByRole("button", { name: "Top tracks" }).click();
  await page.getByRole("radio", { name: "Medium term" }).click();
  await page.getByRole("button", { name: "Generate" }).click();

  await expect.poll(async () => frame.innerHTML(), { timeout: 30_000 }).not.toBe(before);
  expect(storyRequests).toEqual([]);

  const colored = await frame.innerHTML();
  await page.getByLabel("Primary").fill("#00aa00");
  await expect.poll(async () => frame.innerHTML(), { timeout: 30_000 }).not.toBe(colored);
  expect(storyRequests).toEqual([]);

  const requests = await spotifyReads(page);
  expect(
    requests.some(
      (entry) => entry.includes("/v1/me/top/tracks") && entry.includes("time_range=medium_term"),
    ),
  ).toBe(true);
});

test("save downloads a story PNG at 1080 by 1920", async ({ page }) => {
  await connect(page);
  await generateStory(page);
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Save image" }).click(),
  ]);

  expect(download.suggestedFilename()).toBe("bunchify_image.png");
  const path = await download.path();
  expect(path).toBeTruthy();
  const bytes = await readFile(path!);
  expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(bytes.readUInt32BE(16)).toBe(1080);
  expect(bytes.readUInt32BE(20)).toBe(1920);
  await expect(page.getByText("Saved bunchify_image.png")).toBeVisible();
});

test("a top with fewer than five items shows the failure and does not download", async ({ page, request }) => {
  await request.post(`${stub}/__control`, { data: { mode: "insufficient" } });
  await page.goto("/");
  await page.getByRole("button", { name: "Connect Spotify" }).click();
  await page.getByRole("button", { name: "Top artists" }).click();
  await page.getByRole("radio", { name: "Short term" }).click();
  const preview = page.getByRole("region", { name: "Story preview" });
  await expect(page.locator("[data-slot=toast]")).toContainText("You don't have enough data to proceed.");
  await expect(preview.getByText("You don't have enough data to proceed.")).toBeVisible();
  await expect(preview.locator("[data-slot=skeleton]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Share" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Save image" })).toBeDisabled();
  await expect(page.getByRole("img", { name: "Story preview" })).toHaveCount(0);
});

test("a failed story shows a status in the preview instead of a skeleton", async ({ page }) => {
  await page.route("**/api/story-fonts", (route) =>
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "Could not load fonts." }),
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Connect Spotify" }).click();
  await page.getByRole("button", { name: "Top artists" }).click();
  await page.getByRole("radio", { name: "Short term" }).click();
  await page.getByRole("button", { name: "Generate" }).click();

  const preview = page.getByRole("region", { name: "Story preview" });
  await expect(preview.getByText("Could not make your story.")).toBeVisible({ timeout: 30_000 });
  await expect(preview.locator("[data-slot=skeleton]")).toHaveCount(0);
  await expect(preview.getByRole("img", { name: "Story preview" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Share" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Save image" })).toBeDisabled();
});

test("share falls back to downloading the story PNG", async ({ page }) => {
  await connect(page);
  await generateStory(page);
  await page.evaluate(() => {
    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value: () => false,
    });
  });
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Share" }).click(),
  ]);

  expect(download.suggestedFilename()).toBe("bunchify_image.png");
  await expect(page.getByText("Saved bunchify_image.png")).toBeVisible();
});

test("logout returns the listener to Authorize", async ({ page }) => {
  await connect(page);
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/authorize$/);
  await page.goto("/");
  await expect(page).toHaveURL(/\/authorize$/);
});
