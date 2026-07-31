#!/usr/bin/env node
/** Bienvenue + nudge ciblé Royale Boutique + ONG WEZIZA AFRICA */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPTS, "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");
const CONTACTS = path.join(SCRIPTS, "pilot-contacts.json");
const APP = "https://app.wazo-digital.com";
const PRODUCTS = `${APP}/products/add`;
const CAISSE = `${APP}/sales`;
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

const targets = [
  {
    slug: "royale-boutique",
    subject: "Bienvenue sur Wazo Digital — Royale Boutique",
    text: (p) =>
      [
        `Bonjour ${p.name} ! Bienvenue sur *Wazo Digital* 🎉`,
        "",
        "Merci d'avoir créé *Royale Boutique*.",
        "",
        "Pour démarrer en 15 minutes :",
        `1️⃣ Ajoutez 1 produit : ${PRODUCTS}`,
        `2️⃣ Faites 1 vente test : ${CAISSE}`,
        `3️⃣ Partagez votre vitrine : ${APP}/boutique/royale-boutique`,
        "",
        `Guide : ${GUIDE}`,
        "",
        "Jacques — Wazo Digital",
      ].join("\n"),
  },
  {
    slug: "ong-weziza-africa",
    subject: "ONG WEZIZA AFRICA — 1ère vente en 2 minutes",
    text: (p) =>
      [
        `Bonjour ${p.name} !`,
        "",
        "Bravo — *ONG WEZIZA AFRICA* a déjà *1 produit*.",
        "Il reste la *1ère vente* pour démarrer vraiment.",
        "",
        `1️⃣ Ouvrir la caisse : ${CAISSE}`,
        "2️⃣ Cash ou MoMo (≥ 200 FCFA)",
        "3️⃣ Valider → partager le reçu WhatsApp",
        "",
        `Guide : ${GUIDE}`,
        "",
        "Jacques — Wazo Digital",
      ].join("\n"),
  },
];

for (const t of targets) {
  const p = (data.pilots || []).find((x) => x.storeSlug === t.slug);
  if (!p?.email) {
    console.log(`## ${t.slug} [skip no email]`);
    continue;
  }
  const r = await sendEmail(env, p.email, t.subject, t.text(p));
  console.log(`## ${p.name} — ${r.ok ? `[ok] ${p.email} (${r.id})` : `[fail] ${r.error}`}`);
  if (r.ok) {
    p.notes = `Email ${today}. ${p.notes || ""}`.trim();
    p.lastRelanceAt = today;
    p.nextRelanceAt = "2026-07-28";
  }
}

data.updatedAt = today;
fs.writeFileSync(CONTACTS, `${JSON.stringify(data, null, 2)}\n`);
console.log("Terminé.");
