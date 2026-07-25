#!/usr/bin/env node
/**
 * Pitch Wazo PRO aux pilotes completed (hors compte test).
 * Usage: node scripts/pilot-pitch-pro.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPTS, "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");
const CONTACTS = path.join(SCRIPTS, "pilot-contacts.json");
const BILLING = "https://app.wazo-digital.com/billing";

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

console.log("=== Pitch PRO (pilotes completed) ===\n");

for (const p of (data.pilots || []).filter((x) => x.status === "completed" && x.email)) {
  if (String(p.notes || "").includes("Pitch PRO ")) {
    console.log(`## ${p.name} [déjà pitch PRO]`);
    continue;
  }
  if (String(p.email || "").includes("jacquesnoussougan")) {
    console.log(`## ${p.name} [skip compte test]`);
    continue;
  }

  const name = String(p.name || "commerçant").split(/\s+/)[0];
  const store = String(p.business || p.name).trim();
  const text = [
    `Bonjour ${name} !`,
    "",
    `Bravo — *${store}* a déjà des ventes sur Wazo Digital 👏`,
    "",
    "Si vous voulez aller plus loin : *Wazo PRO* (rapport hebdo, équipe, modules avancés).",
    "Paiement Mobile Money depuis l'app — 9,99 €/mois.",
    "",
    `→ Voir / activer PRO : ${BILLING}`,
    "",
    "Pas d'obligation — le plan Starter reste gratuit pour continuer.",
    "",
    "Jacques — Wazo Digital",
  ].join("\n");

  const r = await sendEmail(env, p.email, `${store} — passer en Wazo PRO ?`, text);
  console.log(`## ${p.name} — ${r.ok ? `[ok] ${p.email} (${r.id})` : `[fail] ${r.error}`}`);
  if (r.ok) {
    p.notes = `Pitch PRO ${today}. ${p.notes || ""}`.trim();
    sent += 1;
  }
}

data.updatedAt = today;
fs.writeFileSync(CONTACTS, `${JSON.stringify(data, null, 2)}\n`);
console.log(`\nPitch PRO envoyés: ${sent}`);
