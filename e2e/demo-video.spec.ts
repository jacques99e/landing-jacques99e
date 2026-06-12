import { test, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import { DEMO_TOUR, DEMO_RECORDING } from "./demo-tour.config.mjs";
import { AUDIO_META_PATH, VIDEO_TIMING_PATH } from "../scripts/demo-audio.mjs";

const AUTH_FILE = path.join(process.cwd(), "e2e", ".auth", "user.json");

test.beforeAll(() => {
  if (!fs.existsSync(AUTH_FILE)) {
    test.skip(true, "Session manquante — lancez avec E2E_TEST_EMAIL et E2E_TEST_PASSWORD.");
  }
  if (!fs.existsSync(AUDIO_META_PATH)) {
    test.skip(true, "Audio manquant — lancez: node scripts/generate-demo-audio.mjs");
  }
});

function loadAudioMeta() {
  return JSON.parse(fs.readFileSync(AUDIO_META_PATH, "utf8"));
}

async function dismissGuidedOnboarding(page: Page) {
  const skip = page.getByRole("button", { name: /Passer pour l'instant/i });
  if (await skip.isVisible({ timeout: 2000 }).catch(() => false)) {
    await skip.click();
    await page.waitForTimeout(400);
  }
}

async function waitForPageContent(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page
    .locator("main, [role='main'], h1, h2")
    .first()
    .waitFor({ state: "visible", timeout: 20_000 })
    .catch(() => {});
  await page.waitForTimeout(DEMO_RECORDING.settleMs);
}

async function slowRevealPage(page: Page) {
  await page.evaluate(
    async ({ stepMs }) => {
      const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (max < 160) return;
      const steps = Math.min(14, Math.ceil(max / 140));
      for (let i = 1; i <= steps; i++) {
        window.scrollTo({ top: (max * i) / steps, behavior: "instant" });
        await delay(stepMs);
      }
      await delay(600);
      window.scrollTo({ top: 0, behavior: "instant" });
      await delay(400);
    },
    { stepMs: DEMO_RECORDING.scrollStepMs }
  );
}

test("Enregistrement démo E2E — tous les modules", async ({ page }) => {
  test.setTimeout(900_000);

  const audioMeta = loadAudioMeta();
  const segments = [];

  for (let index = 0; index < DEMO_TOUR.length; index++) {
    const step = DEMO_TOUR[index];
    const audio = audioMeta.segments.find((s: { id: string }) => s.id === step.id);
    const speechMs = audio?.durationMs ?? step.pauseMs;
    const holdMs = Math.max(speechMs + DEMO_RECORDING.visualBufferMs, step.pauseMs);

    const segmentStart = Date.now();
    await page.goto(step.url, { waitUntil: "domcontentloaded" });
    await waitForPageContent(page);
    if (step.id === "landing-tarifs") {
      await page.evaluate(() => {
        document.getElementById("tarifs")?.scrollIntoView({ behavior: "instant", block: "start" });
      });
      await page.waitForTimeout(600);
    }
    const afterContent = Date.now();

    let dismissMs = 0;
    if (step.url.includes("wazo-digital")) {
      const beforeDismiss = Date.now();
      await dismissGuidedOnboarding(page);
      dismissMs = Date.now() - beforeDismiss;
    }

    let scrollMs = 0;
    if (step.scroll) {
      const beforeScroll = Date.now();
      await slowRevealPage(page);
      scrollMs = Date.now() - beforeScroll;
    }

    await page.waitForTimeout(holdMs);
    const totalMs = Date.now() - segmentStart;

    segments.push({
      id: step.id,
      index,
      navigationMs: afterContent - segmentStart,
      dismissMs: dismissMs + scrollMs,
      speechMs,
      holdMs,
      totalMs,
      scrollMs,
    });
  }

  fs.writeFileSync(
    VIDEO_TIMING_PATH,
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        visualBufferMs: DEMO_RECORDING.visualBufferMs,
        viewport: DEMO_RECORDING.viewport,
        segments,
      },
      null,
      2
    )
  );
});
