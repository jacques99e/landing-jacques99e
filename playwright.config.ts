import { defineConfig, devices } from "@playwright/test";
import path from "path";

const LANDING_URL = process.env.E2E_LANDING_URL || "https://landing-jacques99e.vercel.app";
const APP_URL = process.env.E2E_APP_URL || "https://wazo-digital.vercel.app";

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
      name: "demo-video",
      testMatch: /demo-video\.spec\.ts/,
      use: {
        baseURL: LANDING_URL,
        storageState: "e2e/.auth/user.json",
        video: "on",
        viewport: { width: 1280, height: 720 },
        launchOptions: { slowMo: 220 },
      },
    },
  ],
  metadata: { appUrl: APP_URL },
});
