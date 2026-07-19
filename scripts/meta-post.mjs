#!/usr/bin/env node
/**
 * Publie un post marketing Wazo (Facebook Page + Instagram).
 * Usage:
 *   npm run meta:post -- --dry-run
 *   npm run meta:post -- --live
 *   npm run meta:post -- --live --key=register
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (v && !process.env[k]) process.env[k] = v;
  }
}

loadEnvFile(path.join(ROOT, ".env.local"));

const args = process.argv.slice(2);
const live = args.includes("--live");
const dryRun = !live || args.includes("--dry-run");
const keyArg = args.find((a) => a.startsWith("--key="));
const key = keyArg ? keyArg.split("=")[1] : null;

async function main() {
  // Charge le module TS via le chemin compilé alternatif : dupliquer la logique légère
  // en important dynamiquement après build n'est pas dispo. On réutilise fetch Graph ici
  // en important depuis un petit module JS miroir — ou transpile. Plus simple: inline call
  // vers l'API locale si dispo, sinon logique dupliquée minimale.

  const { publishFromEnv } = await import("./lib/meta-publish-runtime.mjs");
  const result = await publishFromEnv({ key, dryRun });

  console.log(`Post: ${result.post.key}`);
  console.log("--- message ---\n" + result.post.message + "\n---------------\n");

  if (result.skipped) {
    console.log(`[info] ${result.skipped}`);
    if (dryRun) {
      console.log("Dry-run OK. Pour publier: npm run meta:post -- --live");
    }
    return;
  }

  if (result.facebook) {
    console.log(
      result.facebook.error
        ? `[fail] Facebook: ${result.facebook.error}`
        : `[ok] Facebook id=${result.facebook.id}`
    );
  }
  if (result.instagram) {
    console.log(
      result.instagram.error
        ? `[fail] Instagram: ${result.instagram.error}`
        : `[ok] Instagram id=${result.instagram.id}`
    );
  }

  if (!result.ok) process.exit(1);
  console.log("\nPublication terminée.");
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
