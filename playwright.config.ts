import { defineConfig, devices } from "@playwright/test";

const appOrigin = "http://localhost:3100";
const stubOrigin = "http://127.0.0.1:4010";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: {
    baseURL: appOrigin,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node tests/spotify-stub.mjs",
      url: `${stubOrigin}/__requests`,
      reuseExistingServer: false,
      env: {
        STUB_PORT: "4010",
        STUB_APP_ORIGIN: appOrigin,
      },
    },
    {
      command: "pnpm exec next dev --port 3100",
      url: appOrigin,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        SPOTIFY_CLIENT_ID: "test-client",
        SPOTIFY_REDIRECT_URI: "http://127.0.0.1:3100/api/auth/callback",
        SPOTIFY_ACCOUNTS_URL: stubOrigin,
        SPOTIFY_API_URL: stubOrigin,
      },
    },
  ],
});
