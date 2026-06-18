#!/usr/bin/env node
/**
 * Ouvre les liens WhatsApp du jour (relance pilote + post réseaux).
 * Usage: node scripts/launch-open.mjs [relance|social|all]
 */
import { spawnSync } from "child_process";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const LANDING = path.join(SCRIPTS, "..");

function capture(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: LANDING, encoding: "utf8", shell: true });
  return `${r.stdout || ""}${r.stderr || ""}`;
}

function extractWaLinks(text) {
  return [...text.matchAll(/https:\/\/wa\.me\/[^\s)]+/g)].map((m) => m[0]);
}

function openUrl(url) {
  console.log(`→ ${url.slice(0, 80)}${url.length > 80 ? "…" : ""}`);
  if (process.platform === "win32") {
    execSync(`start "" "${url.replace(/"/g, '\\"')}"`, { stdio: "ignore", shell: true });
  } else if (process.platform === "darwin") {
    execSync(`open "${url.replace(/"/g, '\\"')}"`, { stdio: "ignore" });
  } else {
    execSync(`xdg-open "${url.replace(/"/g, '\\"')}"`, { stdio: "ignore" });
  }
}

const mode = process.argv[2]?.trim() || "all";
const links = [];

if (mode === "relance" || mode === "all") {
  const out = capture("node", ["scripts/pilot-actions.mjs", "relance"]);
  const pilotLinks = extractWaLinks(out).filter((u) => !u.includes("wa.me/?"));
  links.push(...pilotLinks);
}

if (mode === "social" || mode === "all") {
  const out = capture("node", ["scripts/launch-social.mjs", "pilote"]);
  const social = extractWaLinks(out).find((u) => u.includes("wa.me/?"));
  if (social) links.push(social);
}

if (!links.length) {
  console.log("Aucun lien WhatsApp à ouvrir.");
  process.exit(0);
}

console.log(`=== Ouverture de ${links.length} lien(s) WhatsApp ===\n`);
for (const url of links) openUrl(url);
