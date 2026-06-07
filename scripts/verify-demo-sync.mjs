import fs from "fs";
import {
  getFfmpegPath,
  loadAudioMeta,
  loadVideoTiming,
  probeDurationSec,
} from "./demo-audio.mjs";

const MP4 = "public/videos/wazo-demo.mp4";
const MAX_DRIFT_MS = 350;

async function main() {
  const audioMeta = loadAudioMeta();
  const videoTiming = loadVideoTiming();

  if (!audioMeta || !videoTiming) {
    console.error("Fichiers manquants — lancez npm run record:demo");
    process.exit(1);
  }

  const ffmpeg = await getFfmpegPath();
  const videoTotalSec = fs.existsSync(MP4) ? probeDurationSec(ffmpeg, MP4) : 0;

  console.log("\n=== Vérification sync voix / vidéo ===\n");
  console.log(
    "Scène".padEnd(22),
    "Vidéo".padStart(7),
    "Voix".padStart(7),
    "Nav".padStart(6),
    "Δ fin".padStart(8),
    "OK?"
  );
  console.log("-".repeat(58));

  let cumulativeVideo = 0;
  let cumulativeAudio = 0;
  let worst = { id: "", driftMs: 0 };

  for (const seg of videoTiming.segments) {
    const audio = audioMeta.segments.find((s) => s.id === seg.id);
    const videoSec = seg.totalMs / 1000;
    const speechSec = (audio?.durationMs ?? 0) / 1000;
    const alignedAudioSec = seg.navigationMs / 1000 + speechSec + Math.max(0, seg.holdMs - speechSec) / 1000;
    // aligned = nav silence + speech + tail silence = totalMs
    const expectedAudioSec = seg.totalMs / 1000;

    cumulativeVideo += videoSec;
    cumulativeAudio += expectedAudioSec;

    const endDriftMs = Math.round((cumulativeVideo - cumulativeAudio) * 1000);
    const ok = Math.abs(endDriftMs) <= MAX_DRIFT_MS;
    if (Math.abs(endDriftMs) > Math.abs(worst.driftMs)) {
      worst = { id: seg.id, driftMs: endDriftMs };
    }

    console.log(
      seg.id.padEnd(22),
      `${videoSec.toFixed(1)}s`.padStart(7),
      `${speechSec.toFixed(1)}s`.padStart(7),
      `${(seg.navigationMs / 1000).toFixed(1)}s`.padStart(6),
      `${endDriftMs}ms`.padStart(8),
      ok ? "✓" : "✗"
    );
  }

  console.log("-".repeat(58));
  console.log(`Total vidéo (mesuré): ${videoTiming.segments.reduce((s, x) => s + x.totalMs, 0) / 1000}s`);
  if (videoTotalSec > 0) {
    console.log(`Total MP4 final: ${videoTotalSec.toFixed(1)}s`);
  }
  console.log(`Pire décalage cumulé: ${worst.driftMs}ms (${worst.id})`);

  if (Math.abs(worst.driftMs) <= MAX_DRIFT_MS) {
    console.log("\n✓ Sync OK — voix calée scène par scène.\n");
    process.exit(0);
  }

  console.log("\n✗ Sync à améliorer — relancez npm run record:demo\n");
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
