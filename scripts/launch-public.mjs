#!/usr/bin/env node
/**
 * Lancement officiel au grand public — vérifie, indexe, annonce.
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPTS, "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (v) out[t.slice(0, i).trim()] = v;
  }
  return out;
}

function run(label, cmd, args, cwd = ROOT) {
  console.log(`\n▶ ${label}`);
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: true });
  return r.status === 0;
}

console.log(`\n🚀 Wazo Digital — LANCEMENT GRAND PUBLIC ${new Date().toISOString().slice(0, 10)}\n`);

const ready = run("Vérification production", "npm", ["run", "prepare:public"]);
if (!ready) {
  console.error("\n[!!] Lancement annulé — corrigez les vérifications en échec.");
  process.exit(1);
}

const env = loadEnv(path.join(WAZO, ".env.local"));
const cron = env.CRON_SECRET;
if (cron) {
  console.log("\n▶ Indexation (IndexNow + Bing)");
  try {
    const res = await fetch("https://app.wazo-digital.com/api/cron/submit-indexing", {
      headers: { Authorization: `Bearer ${cron}` },
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.success) {
      for (const r of body.results || []) {
        console.log(`[ok] ${r.site} — ${r.urlCount} URL(s), IndexNow ${r.indexNow?.status}`);
      }
    } else {
      console.log(`[!!] indexation → ${res.status}`, body.error || "");
    }
  } catch (e) {
    console.log(`[!!] indexation: ${e.message}`);
  }
}

run("Texte annonce réseaux", "node", ["scripts/launch-social.mjs", "register"]);

console.log(`
═══════════════════════════════════════════════════════
  ✅ WAZO DIGITAL EST EN LIGNE — GRAND PUBLIC
═══════════════════════════════════════════════════════

  Site vitrine : https://wazo-digital.com
  Application  : https://app.wazo-digital.com
  Inscription  : https://wazo-digital.com/register
  Guide pilote : https://wazo-digital.com/guide-pilote

  Dernière étape manuelle (2 min) :
  → Google Search Console : Vérifier + soumettre le sitemap
    https://search.google.com/search-console
    Sitemap : https://wazo-digital.com/sitemap.xml

  Partager l'annonce :
    npm run launch:open social
`);
