import fs from "fs";
import path from "path";
import { DEMO_RECORDING } from "../e2e/demo-tour.config.mjs";
import {
  buildSyncedNarrationWav,
  getFfmpegPath,
  loadAudioMeta,
  loadVideoTiming,
  probeDurationSec,
  runFfmpeg,
  TMP_DIR,
} from "./demo-audio.mjs";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public", "videos");
const MP4_OUT = path.join(OUT_DIR, "wazo-demo.mp4");
const WEBM_OUT = path.join(OUT_DIR, "wazo-demo.webm");
const POSTER_OUT = path.join(OUT_DIR, "wazo-demo-poster.jpg");

function findLatestWebm(dir) {
  if (!fs.existsSync(dir)) return null;
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = findLatestWebm(full);
      if (nested) files.push(nested);
    } else if (entry.name.endsWith(".webm")) {
      files.push(full);
    }
  }
  if (!files.length) return null;
  files.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return files[0];
}

function buildMp4WithAudio(ffmpeg, webmSource, narrationWav) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const videoDur = probeDurationSec(ffmpeg, webmSource);
  const narrDur = probeDurationSec(ffmpeg, narrationWav);
  console.log(
    `[sync] vidéo ${videoDur.toFixed(2)}s · narration ${narrDur.toFixed(2)}s · Δ ${Math.abs(videoDur - narrDur).toFixed(2)}s`
  );

  const paddedNarration = path.join(TMP_DIR, "narration-final.wav");
  if (Math.abs(videoDur - narrDur) > 0.15) {
    if (narrDur > videoDur) {
      runFfmpeg(ffmpeg, ["-y", "-i", narrationWav, "-t", videoDur.toFixed(3), paddedNarration]);
    } else {
      const padSec = (videoDur - narrDur).toFixed(3);
      runFfmpeg(ffmpeg, [
        "-y",
        "-i",
        narrationWav,
        "-f",
        "lavfi",
        "-t",
        padSec,
        "-i",
        "anullsrc=r=44100:cl=mono",
        "-filter_complex",
        "[0:a][1:a]concat=n=2:v=0:a=1",
        "-c:a",
        "pcm_s16le",
        paddedNarration,
      ]);
    }
  } else {
    fs.copyFileSync(narrationWav, paddedNarration);
  }

  const inputs = ["-i", webmSource, "-i", paddedNarration];
  let filterComplex;
  if (DEMO_RECORDING.musicVolume > 0) {
    inputs.push(
      "-f",
      "lavfi",
      "-i",
      `sine=frequency=196:duration=${videoDur.toFixed(3)},volume=${DEMO_RECORDING.musicVolume}`
    );
    filterComplex =
      "[1:a]volume=1.0[a1];[2:a]volume=1.0[a2];[a1][a2]amix=inputs=2:duration=first[aout]";
  } else {
    filterComplex = "[1:a]volume=1.0[aout]";
  }

  runFfmpeg(ffmpeg, [
    "-y",
    ...inputs,
    "-filter_complex",
    filterComplex,
    "-map",
    "0:v:0",
    "-map",
    "[aout]",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    "-shortest",
    MP4_OUT,
  ]);

  runFfmpeg(ffmpeg, [
    "-y",
    "-i",
    MP4_OUT,
    "-c:v",
    "libvpx-vp9",
    "-crf",
    "32",
    "-b:v",
    "0",
    "-c:a",
    "libopus",
    "-b:a",
    "96k",
    WEBM_OUT,
  ]);

  runFfmpeg(ffmpeg, [
    "-y",
    "-i",
    MP4_OUT,
    "-ss",
    "00:00:03",
    "-vframes",
    "1",
    "-q:v",
    "2",
    POSTER_OUT,
  ]);
}

async function main() {
  const source =
    findLatestWebm(path.join(ROOT, "test-results")) ||
    findLatestWebm(path.join(ROOT, "e2e-report"));

  if (!source) {
    console.error("Aucune vidéo — lancez: npm run record:demo");
    process.exit(1);
  }

  const audioMeta = loadAudioMeta();
  const videoTiming = loadVideoTiming();
  if (!audioMeta || !videoTiming) {
    console.error("Meta audio ou timing vidéo manquant — lancez: npm run record:demo");
    process.exit(1);
  }

  const ffmpeg = await getFfmpegPath();
  console.log("[ffmpeg]", ffmpeg);

  const narrationWav = buildSyncedNarrationWav(ffmpeg, audioMeta, videoTiming);
  buildMp4WithAudio(ffmpeg, source, narrationWav);

  console.log("✓ MP4 Safari:", MP4_OUT);
  console.log("✓ WebM:", WEBM_OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
