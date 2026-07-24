#!/usr/bin/env node
/**
 * Nudge ciblé : Armel (1 produit, 0 vente) → 1ère vente caisse.
 * Usage: node scripts/pilot-nudge-armel.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPTS, "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");
const CONTACTS = path.join(SCRIPTS, "pilot-contacts.json");
const CAISSE = "https://app.wazo-digital.com/sales";
const FEEDBACK = "https://wazo-digital.com/feedback";

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
const armel = (data.pilots || []).find((p) => p.storeSlug === "armel-shop");
if (!armel?.email) {
  console.error("Armel introuvable");
  process.exit(1);
}

const text = [
  "Bonjour Armel !",
  "",
  "Bravo — votre boutique *ARMEL SHOP* a déjà *1 produit*. Il manque juste la *1ère vente* pour valider le parcours.",
  "",
  "Objectif aujourd'hui (2 min) :",
  `1️⃣ Ouvrir la caisse : ${CAISSE}`,
  "2️⃣ Ajouter votre produit → choisir Cash ou MoMo (≥ 200 FCFA)",
  "3️⃣ Valider → partager le reçu WhatsApp",
  "",
  "Astuce MoMo : le client paie sur PayDunya, puis la vente s'enregistre automatiquement.",
  "",
  `Si quelque chose bloque, dites-nous ici : ${FEEDBACK}`,
  "Ou répondez à cet email avec une capture d'écran.",
  "",
  "Jacques — Wazo Digital",
].join("\n");

const result = await sendEmail(
  env,
  armel.email,
  "ARMEL SHOP — 1ère vente en 2 minutes",
  text
);

const today = new Date().toISOString().slice(0, 10);
if (result.ok) {
  console.log(`[ok] Email Armel → ${armel.email} (${result.id})`);
  armel.notes = `Nudge 1ère vente ${today}. ${armel.notes || ""}`.trim();
  armel.lastRelanceAt = today;
  armel.nextRelanceAt = "2026-07-25";
  data.updatedAt = today;
  fs.writeFileSync(CONTACTS, `${JSON.stringify(data, null, 2)}\n`);
} else {
  console.error(`[fail] ${result.error}`);
  process.exit(1);
}
