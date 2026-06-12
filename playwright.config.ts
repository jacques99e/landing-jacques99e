import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { resolveAppUrl, resolveLandingUrl } from "./e2e/urls.mjs";

/** Aligné sur DEMO_RECORDING dans e2e/demo-tour.config.mjs */
const DEMO_VIEWPORT = { width: 1920, height: 1080 };
const DEMO_SLOW_MO_MS = 300;

const LANDING_URL = resolveLandingUrl();
const APP_URL = resolveAppUrl();

export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e-report" }]],
  globalSetup: path.join(__dirname, "e2e", "global-setup.mjs"),
  use: {
    ...devices["Desktop Chrome"],
    baseURL: LANDING_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "landing",
      testMatch: /landing\.spec\.ts/,
      use: { baseURL: LANDING_URL },
    },
    {
      name: "smoke",
      testMatch: /smoke-all-modules\.spec\.ts/,
      use: { baseURL: LANDING_URL },
    },
    {
      name: "full-journey",
      testMatch: /full-journey\.spec\.ts/,
      use: {
        baseURL: LANDING_URL,
        storageState: "e2e/.auth/user.json",
      },
    },
    {
      name: "team-roles",
      testMatch: /team-roles\.spec\.ts/,
      use: { baseURL: LANDING_URL },
    },
    {
      name: "language",
      testMatch: /language\.spec\.ts/,
      use: { baseURL: LANDING_URL },
    },
    {
      name: "demo-video",
      testMatch: /demo-video\.spec\.ts/,
      use: {
        baseURL: LANDING_URL,
        storageState: "e2e/.auth/user.json",
        // Taille explicite : sinon Playwright réduit le viewport à 800×450 max
        video: { mode: "on", size: DEMO_VIEWPORT },
        viewport: DEMO_VIEWPORT,
        launchOptions: { slowMo: DEMO_SLOW_MO_MS },
      },
    },
  ],
  metadata: { appUrl: APP_URL },
});
