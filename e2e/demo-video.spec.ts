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
  }
}

test("Enregistrement démo E2E — tous les modules", async ({ page }) => {
  test.setTimeout(600_000);

  const audioMeta = loadAudioMeta();
  const segments = [];

  for (let index = 0; index < DEMO_TOUR.length; index++) {
    const step = DEMO_TOUR[index];
    const audio = audioMeta.segments.find((s) => s.id === step.id);
    const speechMs = audio?.durationMs ?? step.pauseMs;
    const holdMs = speechMs + DEMO_RECORDING.visualBufferMs;

    const segmentStart = Date.now();
    await page.goto(step.url);
    await page.waitForLoadState("domcontentloaded");
    const afterLoad = Date.now();

    if (step.url.includes("wazo-digital")) {
      await dismissGuidedOnboarding(page);
    }
    const afterDismiss = Date.now();

    await page.waitForTimeout(holdMs);
    const totalMs = Date.now() - segmentStart;

    segments.push({
      id: step.id,
      index,
      navigationMs: afterLoad - segmentStart,
      dismissMs: afterDismiss - afterLoad,
      speechMs,
      holdMs,
      totalMs,
    });
  }

  fs.writeFileSync(
    VIDEO_TIMING_PATH,
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        visualBufferMs: DEMO_RECORDING.visualBufferMs,
        segments,
      },
      null,
      2
    )
  );
});
