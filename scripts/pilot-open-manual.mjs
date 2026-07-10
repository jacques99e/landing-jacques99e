#!/usr/bin/env node
/** Ouvre mailto + WhatsApp pour pilotes sans envoi email automatique. */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const targets = new Set(process.argv.slice(2).map((s) => s.toLowerCase()));
if (!targets.size) {
  targets.add("manthus");
  targets.add("mewe-farms");
  targets.add("espoir");
}

function openUrl(url) {
  if (process.platform === "win32") {
    execSync(`start "" "${url.replace(/"/g, '\\"')}"`, { stdio: "ignore", shell: true });
  }
}

const out = execSync("node scripts/pilot-actions.mjs outreach", {
  cwd: ROOT,
  encoding: "utf8",
  maxBuffer: 10 * 1024 * 1024,
});

for (const part of out.split(/^## /m).slice(1)) {
  const slug = (part.match(/\(([^)]+)\)/) || [])[1]?.trim();
  if (!slug || !targets.has(slug)) continue;
  const mStart = part.indexOf("Bonjour");
  const mEnd = part.indexOf("\n\nWhatsApp");
  const text = part.slice(mStart, mEnd).trim().replace(/\*/g, "");
  const email = (part.match(/email:\s*(\S+)/) || [])[1];
  const mode = part.includes("[welcome]") ? "welcome" : "relance";
  const subject =
    mode === "welcome"
      ? `Bienvenue sur Wazo Digital — ${slug}`
      : `Suivi Wazo Digital — ${slug}`;
  console.log(`→ ${slug}: mailto + WhatsApp`);
  openUrl(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`);
  openUrl(`https://wa.me/?text=${encodeURIComponent(text)}`);
}
