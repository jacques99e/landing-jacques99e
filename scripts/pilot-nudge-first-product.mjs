#!/usr/bin/env node
/**
 * Nudge 1er produit pour pilotes actifs à 0 produit.
 * Usage: node scripts/pilot-nudge-first-product.mjs
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
let sent = 0;
let skipped = 0;

console.log("=== Nudge 1er produit (0p) ===\n");

for (const p of data.pilots || []) {
  if (p.status === "completed") continue;
  if ((p.score?.products ?? 0) > 0) continue;
  if (!p.email) {
    console.log(`## ${p.name || p.storeSlug} [skip no email]`);
    skipped += 1;
    continue;
  }
  if (String(p.notes || "").includes(`Nudge 1er produit ${today}`)) {
    console.log(`## ${p.name || p.storeSlug} [déjà]`);
    skipped += 1;
    continue;
  }

  const name = String(p.name || "commerçant").split(/\s+/)[0];
  const store = String(p.business || p.storeSlug || "votre boutique").trim();
  const text = [
    `Bonjour ${name} !`,
    "",
    `Votre boutique *${store}* est créée — il manque le *1er produit* pour démarrer.`,
    "",
    "Objectif aujourd'hui (3 min) :",
    `1️⃣ Ajouter 1 produit (avec photo si possible) : ${PRODUCTS}`,
    `2️⃣ Puis 1 vente test à la caisse : ${APP}/sales`,
    "",
    `Guide : ${GUIDE}`,
    "",
    "Jacques — Wazo Digital",
  ].join("\n");

  const r = await sendEmail(env, p.email, `${store} — ajoutez votre 1er produit`, text);
  console.log(
    `## ${p.name || p.storeSlug} — ${r.ok ? `[ok] ${p.email} (${r.id})` : `[fail] ${r.error}`}`
  );
  if (r.ok) {
    p.notes = `Nudge 1er produit ${today}. ${p.notes || ""}`.trim();
    p.lastRelanceAt = today;
    sent += 1;
  }
}

data.updatedAt = today;
fs.writeFileSync(CONTACTS, `${JSON.stringify(data, null, 2)}\n`);
console.log(`\nEnvoyés: ${sent} · skip: ${skipped}`);
