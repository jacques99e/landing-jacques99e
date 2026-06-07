import { generateEdgeAudioSegments } from "./demo-audio.mjs";

generateEdgeAudioSegments()
  .then((meta) => {
    const totalMs = meta.segments.reduce((s, x) => s + x.durationMs, 0);
    console.log(`✓ ${meta.segments.length} segments · ${(totalMs / 1000).toFixed(1)}s de voix`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
