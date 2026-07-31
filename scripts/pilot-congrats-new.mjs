#!/usr/bin/env node
/** Félicitations Ariol Store + Le Paysan SARL (nouveaux completed) */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPTS, "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");
const CONTACTS = path.join(SCRIPTS, "pilot-contacts.json");
const BILLING = "https://app.wazo-digital.com/billing";
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

function openWa(phone, text) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 8) return;
  const url = `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
  if (process.platform === "win32") {
    spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
  }
}

const env = loadEnv();
const data = JSON.parse(fs.readFileSync(CONTACTS, "utf8"));
const today = new Date().toISOString().slice(0, 10);

const targets = [
  {
    slug: "ariolstore",
    subject: "Bravo Ariol Store — parcours pilote réussi 🎉",
    text: (p) =>
      [
        `Bonjour ${p.name} !`,
        "",
        "Bravo — *Ariol Store* a déjà *1 produit* et *1 vente*. Vous êtes activé sur Wazo Digital.",
        "",
        "Prochaines étapes :",
        "1️⃣ Partagez un reçu / votre boutique en Status WhatsApp",
        `2️⃣ Explorez PRO (stock avancé, analytics) : ${BILLING}`,
        `3️⃣ Guide : ${GUIDE}`,
        "",
        "Jacques — Wazo Digital",
      ].join("\n"),
    wa: (p) =>
      `Bonjour ! Bravo — *Ariol Store* est active (produit + vente). Partagez un Status, et PRO ici : ${BILLING}. Jacques / Wazo Digital`,
  },
  {
    slug: "le-paysan-sarl",
    subject: "Bravo Le Paysan SARL — 2 produits, 2 ventes 🎉",
    text: (p) =>
      [
        `Bonjour ${p.name} !`,
        "",
        "Bravo — *Le Paysan SARL* a *2 produits* et *2 ventes*. Excellent démarrage.",
        "",
        "Prochaines étapes :",
        "1️⃣ Status WhatsApp avec votre boutique",
        `2️⃣ Plan PRO : ${BILLING}`,
        `3️⃣ Guide : ${GUIDE}`,
        "",
        "Jacques — Wazo Digital",
      ].join("\n"),
    wa: (p) =>
      `Bonjour ! Bravo — *Le Paysan SARL* (2 produits, 2 ventes). Continuez + PRO : ${BILLING}. Jacques / Wazo Digital`,
  },
];

for (const t of targets) {
  const p = (data.pilots || []).find((x) => x.storeSlug === t.slug);
  if (!p) {
    console.log(`## ${t.slug} [missing tracker]`);
    continue;
  }
  if (String(p.notes || "").includes(`Félicitations ${today}`)) {
    console.log(`## ${p.name} [déjà félicité aujourd'hui]`);
    continue;
  }
  try {
    if (p.email) {
      const r = await sendEmail(env, p.email, t.subject, t.text(p));
      console.log(`## ${p.name} email — ${r.ok ? `[ok] ${r.id}` : `[fail] ${r.error}`}`);
    } else {
      console.log(`## ${p.name} [pas d'email]`);
    }
    const wa = String(p.whatsapp || p.phone || "").replace(/\D/g, "");
    if (wa) {
      openWa(wa, t.wa(p));
      console.log(`## ${p.name} WA ouvert → ${wa}`);
    }
    p.notes = `Félicitations ${today}. ${p.notes || ""}`.trim();
    p.lastRelanceAt = today;
    p.nextRelanceAt = "2026-07-31";
    p.status = "completed";
    // Save after each target so a network fail doesn't lose prior notes
    data.updatedAt = today;
    fs.writeFileSync(CONTACTS, `${JSON.stringify(data, null, 2)}\n`);
  } catch (err) {
    console.log(`## ${p.name} [error] ${err?.message || err}`);
  }
}

// Fix Paulasco WA if truncated
const paul = (data.pilots || []).find((x) => x.storeSlug === "paulasco-store");
if (paul) {
  paul.whatsapp = "2290141914075";
  paul.phone = "2290141914075";
}

data.updatedAt = today;
fs.writeFileSync(CONTACTS, `${JSON.stringify(data, null, 2)}\n`);
console.log("Terminé.");
