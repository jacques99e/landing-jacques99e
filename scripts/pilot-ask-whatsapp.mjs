#!/usr/bin/env node
/**
 * Demande le numéro WhatsApp aux pilotes actifs avec produits, sans WA.
 * Usage: node scripts/pilot-ask-whatsapp.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPTS, "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");
const CONTACTS = path.join(SCRIPTS, "pilot-contacts.json");
const SUPPORT = "https://wa.me/22893924040";

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

console.log("=== Demande WhatsApp (produits, sans WA) ===\n");

for (const p of data.pilots || []) {
  if ((p.score?.products ?? 0) < 1) continue;
  if (p.whatsapp || p.phone) continue;
  if (!p.email) continue;
  if (String(p.notes || "").includes(`Demande WhatsApp ${today}`)) {
    console.log(`## ${p.name} [déjà]`);
    continue;
  }

  const name = String(p.name || "commerçant").split(/\s+/)[0];
  const store = String(p.business || p.name).trim();
  const text = [
    `Bonjour ${name} !`,
    "",
    `Vous avancez bien sur *${store}* (${p.score.products} produit(s)).`,
    "",
    "Pour vous accompagner plus vite (aide + rappels utiles), pouvez-vous nous envoyer votre *numéro WhatsApp* ?",
    "",
    "→ Répondez simplement à cet email avec votre numéro",
    `→ Ou écrivez-nous ici : ${SUPPORT}`,
    "",
    "Merci — Jacques / Wazo Digital",
  ].join("\n");

  const r = await sendEmail(env, p.email, `${store} — votre WhatsApp pour l'accompagnement`, text);
  console.log(`## ${p.name} — ${r.ok ? `[ok] ${p.email}` : `[fail] ${r.error}`}`);
  if (r.ok) {
    p.notes = `Demande WhatsApp ${today}. ${p.notes || ""}`.trim();
    sent += 1;
  }
}

data.updatedAt = today;
fs.writeFileSync(CONTACTS, `${JSON.stringify(data, null, 2)}\n`);
console.log(`\nDemandes WhatsApp envoyées: ${sent}`);
