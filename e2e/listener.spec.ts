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
  await expect(page.getByRole("button", { name: "Top artists" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Short term" })).toBeVisible();
  await expect(page.getByLabel("Primary")).toBeVisible();
  await expect(page.getByLabel("Secondary")).toBeVisible();
  await expect(page.getByRole("button", { name: "Generate" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save image" })).toBeEnabled();

  const leaked = await page.evaluate(() => ({
    storage: JSON.stringify(localStorage),
    cookie: document.cookie,
    text: document.body.innerText,
  }));
  expect(leaked.storage).not.toContain("test-access-token");
  expect(leaked.cookie).not.toContain("test-access-token");
  expect(leaked.text).not.toContain("test-access-token");
});

test("changing the top and generating updates the story preview", async ({ page }) => {
  await connect(page);
  const preview = page.getByRole("img", { name: "Story preview" });
  const before = await preview.getAttribute("src");

  await page.getByRole("button", { name: "Top tracks" }).click();
  await page.getByRole("button", { name: "Medium term" }).click();
  await page.getByRole("button", { name: "Generate" }).click();

  await expect.poll(async () => preview.getAttribute("src"), { timeout: 30_000 }).not.toBe(before);

  const recorded = await page.request.get(`${stub}/__requests`);
  const body = (await recorded.json()) as { requests: string[] };
  expect(
    body.requests.some(
      (entry) => entry.includes("/v1/me/top/tracks") && entry.includes("time_range=medium_term"),
    ),
  ).toBe(true);
});

test("save downloads a story PNG at 828 by 1792", async ({ page }) => {
  await connect(page);
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Save image" }).click(),
  ]);

  expect(download.suggestedFilename()).toBe("bunchify_image.png");
  const path = await download.path();
  expect(path).toBeTruthy();
  const bytes = await readFile(path!);
  expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(bytes.readUInt32BE(16)).toBe(828);
  expect(bytes.readUInt32BE(20)).toBe(1792);
  await expect(page.getByText("Saved bunchify_image.png")).toBeVisible();
});

test("a top with fewer than five items shows the failure and does not download", async ({ page, request }) => {
  await request.post(`${stub}/__control`, { data: { mode: "insufficient" } });
  await page.goto("/");
  await page.getByRole("button", { name: "Connect Spotify" }).click();
  await expect(page.getByText("You don't have enough data to proceed.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Save image" })).toBeDisabled();
  await expect(page.getByRole("img", { name: "Story preview" })).toHaveCount(0);
});

test("logout returns the listener to Authorize", async ({ page }) => {
  await connect(page);
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/authorize$/);
  await page.goto("/");
  await expect(page).toHaveURL(/\/authorize$/);
});
