#!/usr/bin/env node
/**
 * Relance PRO chauds — appel perso WA (2+ ventes, numéro connu).
 * Usage: node scripts/pilot-pro-hot-followup.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const CONTACTS = path.join(SCRIPTS, "pilot-contacts.json");
const BILLING = "https://app.wazo-digital.com/billing?plan=pro&pay=1";
const TAG = "PRO hot followup 2026-08-26";

const HOT_SLUGS = [
  "paulasco-store",
  "finesse-shop",
  "ramatou",
  "ange-beugre-academy",
  "godsbag",
  "le-paysan-sarl",
  "digital-master-pro",
  "awa",
];

function openWa(phone, text) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 8) return false;
  const url = `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
  if (process.platform === "win32") {
    spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
  }
  return true;
}

const data = JSON.parse(fs.readFileSync(CONTACTS, "utf8"));
const today = new Date().toISOString().slice(0, 10);
console.log(`=== ${TAG} ===\n`);

for (const slug of HOT_SLUGS) {
  const p = (data.pilots || []).find((x) => x.storeSlug === slug);
  if (!p) {
    console.log(`## ${slug} [missing]`);
    continue;
  }
  if (String(p.notes || "").includes(TAG)) {
    console.log(`## ${p.name} [déjà]`);
    continue;
  }
  const wa = String(p.whatsapp || p.phone || "").replace(/\D/g, "");
  if (wa.length < 8) {
    console.log(`## ${p.name} [pas de WA]`);
    continue;
  }
  const name = String(p.name || "").split(/\s+/)[0];
  const store = String(p.business || p.name).trim();
  const sales = p.score?.sales ?? "?";
  const msg = [
    `Bonjour ${name} ! C'est Jacques / Wazo Digital.`,
    "",
    `Vous avez déjà *${sales} ventes* sur *${store}* — bravo.`,
    "Question rapide : avez-vous pu tester le lien PRO (MoMo 6 550 FCFA) ?",
    "",
    `→ ${BILLING}`,
    "",
    "Si blocage au paiement, répondez « bloqué » avec une capture — je vous guide.",
  ].join("\n");

  if (openWa(wa, msg)) {
    console.log(`## ${p.name} WA → ${wa}`);
    p.notes = `${TAG}. ${p.notes || ""}`.trim();
    p.lastRelanceAt = today;
  }
}

data.updatedAt = today;
fs.writeFileSync(CONTACTS, `${JSON.stringify(data, null, 2)}\n`);
console.log("\n✅ Onglets WA ouverts — envoie les messages perso.");
