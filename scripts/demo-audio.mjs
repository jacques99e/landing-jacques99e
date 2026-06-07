import fs from "fs";
import path from "path";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { execFileSync } from "child_process";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { DEMO_TOUR, DEMO_RECORDING } from "../e2e/demo-tour.config.mjs";

export const TMP_DIR = path.join(process.cwd(), ".demo-build");
export const AUDIO_META_PATH = path.join(TMP_DIR, "demo-audio-meta.json");
export const VIDEO_TIMING_PATH = path.join(process.cwd(), "e2e", "demo-video-timing.json");

export async function getFfmpegPath() {
  try {
    const mod = await import("@ffmpeg-installer/ffmpeg");
    return mod.default?.path || mod.path;
  } catch {
    return "ffmpeg";
  }
}

export function runFfmpeg(ffmpeg, args) {
  execFileSync(ffmpeg, args, { stdio: "inherit" });
}

export function probeDurationSec(ffmpeg, file) {
  try {
    execFileSync(ffmpeg, ["-i", file], { stdio: ["ignore", "pipe", "pipe"] });
  } catch (err) {
    const stderr = err.stderr?.toString() || "";
    const match = stderr.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
    if (match) {
      return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
    }
  }
  return 0;
}

export async function generateEdgeAudioSegments() {
  fs.mkdirSync(TMP_DIR, { recursive: true });

  const tts = new MsEdgeTTS({});
  await tts.setMetadata(
    DEMO_RECORDING.edgeVoice,
    OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3
  );

  console.log(`[edge] Voix: ${DEMO_RECORDING.edgeVoice} · débit ${DEMO_RECORDING.edgeRate}`);

  const ffmpeg = await getFfmpegPath();
  const segments = [];

  for (let index = 0; index < DEMO_TOUR.length; index++) {
    const step = DEMO_TOUR[index];
    const mp3 = path.join(TMP_DIR, `seg-${String(index).padStart(2, "0")}.mp3`);
    console.log(`[edge] ${step.id}`);
    const { audioStream } = tts.toStream(step.narration, {
      rate: DEMO_RECORDING.edgeRate,
    });
    await pipeline(audioStream, createWriteStream(mp3));
    const durationSec = probeDurationSec(ffmpeg, mp3);
    segments.push({
      id: step.id,
      index,
      mp3,
      durationMs: Math.round(durationSec * 1000),
    });
  }

  tts.close();

  const meta = {
    voice: DEMO_RECORDING.edgeVoice,
    rate: DEMO_RECORDING.edgeRate,
    generatedAt: new Date().toISOString(),
    segments,
  };
  fs.writeFileSync(AUDIO_META_PATH, JSON.stringify(meta, null, 2));
  return meta;
}

export function loadAudioMeta() {
  if (!fs.existsSync(AUDIO_META_PATH)) return null;
  return JSON.parse(fs.readFileSync(AUDIO_META_PATH, "utf8"));
}

export function loadVideoTiming() {
  if (!fs.existsSync(VIDEO_TIMING_PATH)) return null;
  return JSON.parse(fs.readFileSync(VIDEO_TIMING_PATH, "utf8"));
}

/** Caler l'audio sur la durée vidéo de chaque scène (silence en tête = temps de chargement). */
export function buildSyncedNarrationWav(ffmpeg, audioMeta, videoTiming) {
  const aligned = [];

  for (const seg of videoTiming.segments) {
    const audio = audioMeta.segments.find((s) => s.id === seg.id);
    if (!audio) throw new Error(`Segment audio manquant: ${seg.id}`);

    const totalSec = seg.totalMs / 1000;
    const leadSec = Math.max(0, (seg.navigationMs + (seg.dismissMs || 0)) / 1000);
    const speechSec = probeDurationSec(ffmpeg, audio.mp3);
    const tailSec = Math.max(0, totalSec - leadSec - speechSec);

    const outWav = path.join(TMP_DIR, `aligned-${String(seg.index).padStart(2, "0")}.wav`);

    runFfmpeg(ffmpeg, [
      "-y",
      "-f",
      "lavfi",
      "-t",
      leadSec.toFixed(3),
      "-i",
      "anullsrc=r=44100:cl=mono",
      "-i",
      audio.mp3,
      "-f",
      "lavfi",
      "-t",
      tailSec.toFixed(3),
      "-i",
      "anullsrc=r=44100:cl=mono",
      "-filter_complex",
      "[0:a][1:a][2:a]concat=n=3:v=0:a=1[out]",
      "-map",
      "[out]",
      "-c:a",
      "pcm_s16le",
      outWav,
    ]);

    aligned.push(outWav);
  }

  const listFile = path.join(TMP_DIR, "concat-synced.txt");
  fs.writeFileSync(
    listFile,
    aligned.map((f) => `file '${f.replace(/\\/g, "/")}'`).join("\n")
  );

  const narrationWav = path.join(TMP_DIR, "narration-synced.wav");
  runFfmpeg(ffmpeg, [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listFile,
    "-c:a",
    "pcm_s16le",
    narrationWav,
  ]);

  return narrationWav;
}
