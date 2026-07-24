#!/usr/bin/env node
/**
 * Demande de feedback aux pilotes (email Resend).
 * Usage: node scripts/pilot-ask-feedback.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPTS, "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");
const CONTACTS = path.join(SCRIPTS, "pilot-contacts.json");
const FEEDBACK = "https://wazo-digital.com/feedback";
const APP = "https://app.wazo-digital.com";
const SUPPORT_WA = "https://wa.me/22893924040";

function loadEnv() {
  const out = {};
  for (const file of [path.join(WAZO, ".env.local"), path.join(ROOT, ".env.local")]) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
      if (v) out[t.slice(0, i).trim()] = v;
    }
  }
  return out;
}

function firstName(p) {
  return String(p.name || p.business || "commerçant")
    .trim()
    .split(/\s+/)[0];
}

function buildMessage(p) {
  const name = firstName(p);
  return [
    `Bonjour ${name} !`,
    "",
    "Vous faites partie des *pilotes Wazo Digital*. Votre expérience compte beaucoup pour nous.",
    "",
    "Pouvez-vous prendre *2 minutes* pour nous dire :",
    "1️⃣ Ce qui marche bien dans l'app",
    "2️⃣ Ce qui est encore difficile",
    "3️⃣ La fonctionnalité qui vous manque le plus",
    "",
    `👉 Formulaire rapide : ${FEEDBACK}`,
    "",
    "Ou répondez simplement à cet email / WhatsApp — même 3 phrases aident.",
    "",
    `App : ${APP}`,
    `WhatsApp support : ${SUPPORT_WA}`,
    "",
    "Merci pour votre aide — on améliore Wazo grâce à vous.",
    "Jacques — Wazo Digital",
  ].join("\n");
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

const data = JSON.parse(fs.readFileSync(CONTACTS, "utf8"));
const env = loadEnv();
const pilots = (data.pilots || []).filter((p) => p.email && String(p.email).includes("@"));

console.log(`=== Demande feedback pilotes (${pilots.length}) ===\n`);

const today = new Date().toISOString().slice(0, 10);
let sent = 0;

for (const p of pilots) {
  // Skip known disposable if clearly useless? Keep AWODJE anyway for completeness but note.
  const text = buildMessage(p);
  const subject = "2 min pour améliorer Wazo Digital — votre avis";
  console.log(`## ${p.name} (${p.storeSlug || "—"})`);
  const result = await sendEmail(env, p.email, subject, text);
  if (result.ok) {
    console.log(`   [ok] Email → ${p.email} (${result.id})`);
    sent += 1;
    p.notes = `Feedback demandé ${today}. ${p.notes || ""}`.trim();
    p.lastFeedbackAskedAt = today;
  } else {
    console.log(`   [fail] ${p.email}: ${result.error}`);
  }
  console.log("");
}

data.updatedAt = today;
data.lastFeedbackAskAt = today;
fs.writeFileSync(CONTACTS, `${JSON.stringify(data, null, 2)}\n`);

console.log(`Terminé — ${sent}/${pilots.length} emails envoyés.`);
console.log(`Formulaire : ${FEEDBACK}`);
