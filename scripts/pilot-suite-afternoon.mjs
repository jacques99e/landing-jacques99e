#!/usr/bin/env node
/** Suite 29/07 après-midi : Espoir PRO renew + ask WA + followup silence */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPTS, "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");
const CONTACTS = path.join(SCRIPTS, "pilot-contacts.json");
const BILLING = "https://app.wazo-digital.com/billing";
const PRODUCTS = "https://app.wazo-digital.com/products/add";
const CAISSE = "https://app.wazo-digital.com/sales";
const SUPPORT = "https://wa.me/22893924040";
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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const env = loadEnv();
const data = JSON.parse(fs.readFileSync(CONTACTS, "utf8"));
const today = new Date().toISOString().slice(0, 10);

console.log("=== 1) Espoir — réactivation PRO (expired) ===\n");
{
  const p = (data.pilots || []).find((x) => x.storeSlug === "espoir");
  if (!p?.email) console.log("[skip]");
  else if (String(p.notes || "").includes(`Nudge PRO renew ${today}`)) {
    console.log("[déjà aujourd'hui]");
  } else {
    const text = [
      `Bonjour ${p.name} !`,
      "",
      "Votre essai / abonnement *Wazo PRO* est expiré sur *Espoir*.",
      "",
      "Pour réactiver (rapports, stock avancé, analytics) :",
      `→ ${BILLING}`,
      "",
      "Paiement Mobile Money. Le plan gratuit reste disponible pour continuer.",
      "",
      `Besoin d'aide ? ${SUPPORT}`,
      "",
      "Jacques — Wazo Digital",
    ].join("\n");
    const r = await sendEmail(env, p.email, "Espoir — réactivez Wazo PRO", text);
    console.log(r.ok ? `[ok] ${r.id}` : `[fail] ${r.error}`);
    if (r.ok) {
      p.notes = `Nudge PRO renew ${today}. ${p.notes || ""}`.trim();
      p.lastRelanceAt = today;
      p.nextRelanceAt = "2026-08-01";
    }
    await sleep(700);
  }
}

console.log("\n=== 2) Demande WhatsApp (completed / prod sans WA) ===\n");
const askWa = (data.pilots || []).filter((p) => {
  const wa = String(p.whatsapp || p.phone || "").replace(/\D/g, "");
  if (wa.length >= 8) return false;
  if (!p.email) return false;
  if (String(p.notes || "").includes(`Demande WhatsApp ${today}`)) return false;
  const prod = p.score?.products || 0;
  return p.status === "completed" || prod >= 1;
});

for (const p of askWa.slice(0, 12)) {
  const store = String(p.business || p.name).trim();
  const text = [
    `Bonjour ${String(p.name).split(/\s+/)[0]} !`,
    "",
    `Pour mieux vous accompagner sur *${store}*, pouvez-vous répondre avec votre *numéro WhatsApp* (indicatif pays) ?`,
    "",
    `Ou écrivez-nous ici : ${SUPPORT}`,
    "",
    "Jacques — Wazo Digital",
  ].join("\n");
  try {
    const r = await sendEmail(env, p.email, `${store} — votre WhatsApp ?`, text);
    console.log(`## ${p.name} — ${r.ok ? `[ok]` : `[fail] ${r.error}`}`);
    if (r.ok) {
      p.notes = `Demande WhatsApp ${today}. ${p.notes || ""}`.trim();
      p.lastRelanceAt = today;
      p.nextRelanceAt = "2026-08-01";
    }
    await sleep(750);
  } catch (e) {
    console.log(`## ${p.name} [error] ${e.message || e}`);
  }
}

console.log("\n=== 3) Relance silence (0 produit, next due, pas contacté aujourd'hui) ===\n");
const silence = (data.pilots || []).filter((p) => {
  if (p.status === "completed") return false;
  if ((p.score?.products || 0) > 0) return false;
  if (!p.email) return false;
  if (String(p.notes || "").includes(today)) return false;
  const next = p.nextRelanceAt || "2026-07-27";
  return next <= today;
});

for (const p of silence.slice(0, 10)) {
  const store = String(p.business || p.name).trim();
  const text = [
    `Bonjour ${String(p.name).split(/\s+/)[0]} !`,
    "",
    `Votre boutique *${store}* est prête. Objectif aujourd'hui (3 min) :`,
    `1️⃣ Ajouter 1 produit : ${PRODUCTS}`,
    `2️⃣ Faire 1 vente test : ${CAISSE}`,
    "",
    `Guide : ${GUIDE}`,
    "",
    "Jacques — Wazo Digital",
  ].join("\n");
  try {
    const r = await sendEmail(env, p.email, `${store} — 1 produit aujourd'hui`, text);
    console.log(`## ${p.name} — ${r.ok ? `[ok]` : `[fail] ${r.error}`}`);
    if (r.ok) {
      p.notes = `Nudge 1er produit ${today}. ${p.notes || ""}`.trim();
      p.lastRelanceAt = today;
      p.nextRelanceAt = "2026-08-01";
    }
    await sleep(750);
  } catch (e) {
    console.log(`## ${p.name} [error] ${e.message || e}`);
  }
}

// Paulasco lock
const paul = (data.pilots || []).find((x) => x.storeSlug === "paulasco-store");
if (paul) {
  paul.whatsapp = "2290141914075";
  paul.phone = "2290141914075";
}

data.updatedAt = today;
fs.writeFileSync(CONTACTS, `${JSON.stringify(data, null, 2)}\n`);
console.log("\nTerminé — suite après-midi.");
