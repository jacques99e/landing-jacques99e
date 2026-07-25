#!/usr/bin/env node
/**
 * Espoir a eu PRO (expiré) mais 0 produit — relance activation.
 * Usage: node scripts/pilot-nudge-espoir-pro.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPTS, "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");
const CONTACTS = path.join(SCRIPTS, "pilot-contacts.json");
const APP = "https://app.wazo-digital.com";
const PRODUCTS = `${APP}/products/add`;
const BILLING = `${APP}/billing`;
const GUIDE = "https://wazo-digital.com/guide-pilote";

function loadEnv() {
  const out = {};
  for (const file of [path.join(WAZO, ".env.local"), path.join(ROOT, ".env.local")]) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      out[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
  return out;
}

function toHtml(text) {
  return text
    .replace(/\*/g, "")
    .split("\n")
    .map((line) => {
      const escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      if (!escaped.trim()) return "<br>";
      const linked = escaped.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>');
      return `<p style="margin:0 0 8px;font-family:sans-serif;font-size:15px;line-height:1.5">${linked}</p>`;
    })
    .join("\n");
}

async function sendEmail(env, to, subject, text) {
  const key = env.RESEND_API_KEY?.trim();
  const from =
    env.REPORT_EMAIL_FROM?.trim() || "Wazo Digital <onboarding@wazo-digital.com>";
  if (!key) return { ok: false, error: "RESEND_API_KEY manquant" };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text: text.replace(/\*/g, ""),
      html: `<div style="max-width:560px;padding:16px">${toHtml(text)}</div>`,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: body.message || res.statusText };
  return { ok: true, id: body.id };
}

const env = loadEnv();
const data = JSON.parse(fs.readFileSync(CONTACTS, "utf8"));
const today = new Date().toISOString().slice(0, 10);
const p = (data.pilots || []).find((x) => x.storeSlug === "espoir");
if (!p?.email) {
  console.error("Espoir introuvable");
  process.exit(1);
}
if (String(p.notes || "").includes(`Nudge PRO/activation ${today}`)) {
  console.log("[skip] déjà envoyé aujourd'hui");
  process.exit(0);
}

const text = [
  "Bonjour Espoir !",
  "",
  "On a vu que vous avez testé *Wazo PRO* — super initiative 👏",
  "Pour en tirer vraiment profit, il manque encore le démarrage boutique :",
  "",
  `1️⃣ Ajouter votre 1er produit : ${PRODUCTS}`,
  `2️⃣ Faire 1 vente test à la caisse : ${APP}/sales`,
  `3️⃣ (Optionnel) réactiver PRO quand vous êtes prêt : ${BILLING}`,
  "",
  "Le plan Starter reste gratuit — PRO sert surtout pour l'équipe et les rapports.",
  "",
  `Guide pas à pas : ${GUIDE}`,
  "",
  "Bloqué ? Répondez avec une capture — on vous aide.",
  "",
  "Jacques — Wazo Digital",
].join("\n");

const r = await sendEmail(
  env,
  p.email,
  "Espoir — finalisez votre démarrage Wazo (produit + vente)",
  text
);
if (r.ok) {
  console.log(`[ok] ${p.email} (${r.id})`);
  p.notes = `Nudge PRO/activation ${today}. ${p.notes || ""}`.trim();
  p.lastRelanceAt = today;
  data.updatedAt = today;
  fs.writeFileSync(CONTACTS, `${JSON.stringify(data, null, 2)}\n`);
} else {
  console.error(`[fail] ${r.error}`);
  process.exit(1);
}
