#!/usr/bin/env node
/**
 * Suite 31/07 — 1er PRO + nouveaux completed (God's bag, ANGE)
 * Usage: node scripts/pilot-suite-today.mjs
 */
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
  if (digits.length < 8) return false;
  const url = `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
  if (process.platform === "win32") {
    spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
  }
  return true;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function bySlug(data, slug) {
  return (data.pilots || []).find((x) => x.storeSlug === slug);
}

const env = loadEnv();
const data = JSON.parse(fs.readFileSync(CONTACTS, "utf8"));
const today = new Date().toISOString().slice(0, 10);

console.log("=== Suite 31/07 — focus 1er PRO ===\n");

// 1) Nouveaux completed : congrats + PRO
console.log("=== 1) Congrats + PRO (nouveaux) ===\n");
for (const slug of ["godsbag", "ange-beugre-academy"]) {
  const p = bySlug(data, slug);
  if (!p) {
    console.log(`## ${slug} [missing]`);
    continue;
  }
  if (String(p.notes || "").includes(`Félicitations ${today}`)) {
    console.log(`## ${p.name} [déjà félicité]`);
    continue;
  }
  const store = String(p.business || p.name).trim();
  const sales = p.score?.sales ?? "?";
  const products = p.score?.products ?? "?";
  const text = [
    `Bonjour ${String(p.name || "").split(/\s+/)[0]} !`,
    "",
    `Bravo — *${store}* a *${products} produit(s)* et *${sales} vente(s)*. Vous êtes activé sur Wazo Digital 🎉`,
    "",
    "Pour aller plus loin : *Wazo PRO* (rapport hebdo, équipe, modules avancés).",
    "Paiement Mobile Money — 9,99 €/mois.",
    "",
    `→ Activer PRO : ${BILLING}`,
    `Guide : ${GUIDE}`,
    "",
    "Jacques — Wazo Digital",
  ].join("\n");

  if (p.email && !String(p.email).includes("jacquesnoussougan")) {
    const r = await sendEmail(env, p.email, `Bravo ${store} — parcours pilote réussi 🎉`, text);
    console.log(`## ${p.name} email — ${r.ok ? `[ok] ${r.id}` : `[fail] ${r.error}`}`);
  } else {
    console.log(`## ${p.name} email — [skip]`);
  }

  const wa = String(p.whatsapp || p.phone || "").replace(/\D/g, "");
  if (wa.length >= 8) {
    openWa(
      wa,
      `Bonjour ! Bravo — *${store}* est active (${products}p / ${sales}v). Wazo PRO (9,99 €/mois MoMo) : ${BILLING}. Jacques / Wazo Digital`
    );
    console.log(`## ${p.name} WA → ${wa}`);
  } else {
    console.log(`## ${p.name} WA — [pas de numéro]`);
  }

  p.status = "completed";
  p.notes = `Félicitations ${today}. Pitch PRO ${today}. Pitch PRO WA ${today}. ${p.notes || ""}`.trim();
  p.lastRelanceAt = today;
  p.nextRelanceAt = "2026-08-03";
  await sleep(800);
}

// 2) Espoir — renew PRO
console.log("\n=== 2) Espoir — renew PRO ===\n");
{
  const p = bySlug(data, "espoir");
  if (!p) console.log("[missing]");
  else if (String(p.notes || "").includes(`Nudge PRO renew ${today}`)) {
    console.log("[déjà aujourd'hui]");
  } else if (p.email) {
    const text = [
      "Bonjour Espoir !",
      "",
      "Votre essai *Wazo PRO* est expiré.",
      "Pour le réactiver (Mobile Money, 9,99 €/mois) :",
      BILLING,
      "",
      "Le plan gratuit reste disponible pour continuer.",
      "",
      "Jacques — Wazo Digital",
    ].join("\n");
    const r = await sendEmail(env, p.email, "Réactiver Wazo PRO ?", text);
    console.log(`email — ${r.ok ? `[ok] ${r.id}` : `[fail] ${r.error}`}`);
    if (r.ok) {
      p.notes = `Nudge PRO renew ${today}. ${p.notes || ""}`.trim();
      p.lastRelanceAt = today;
    }
  }
}

// 3) Soft PRO WA — completed chauds (pas déjà WA PRO aujourd'hui)
console.log("\n=== 3) Soft PRO WA (completed) ===\n");
const hot = [
  "paulasco-store",
  "finesse-shop",
  "charity-shop",
  "ariolstore",
  "le-paysan-sarl",
  "josgrace",
  "godsbag",
  "ange-beugre-academy",
];
for (const slug of hot) {
  const p = bySlug(data, slug);
  if (!p || p.status !== "completed") continue;
  if (String(p.notes || "").includes(`Pitch PRO WA ${today}`)) {
    console.log(`## ${p.name} [WA PRO déjà]`);
    continue;
  }
  const wa = String(p.whatsapp || p.phone || "").replace(/\D/g, "");
  if (wa.length < 8) {
    console.log(`## ${p.name} [pas de WA]`);
    continue;
  }
  const store = String(p.business || p.name).trim();
  const msg = [
    `Bonjour ${String(p.name || "").split(/\s+/)[0]} !`,
    `Petit rappel : *${store}* tourne déjà sur Wazo.`,
    `Si vous voulez PRO (9,99 €/mois MoMo) : ${BILLING}`,
    "Jacques / Wazo Digital",
  ].join(" ");
  if (openWa(wa, msg)) {
    console.log(`## ${p.name} WA PRO → ${wa}`);
    p.notes = `Pitch PRO WA ${today}. ${p.notes || ""}`.trim();
    p.lastRelanceAt = today;
    await sleep(700);
  }
}

data.updatedAt = today;
fs.writeFileSync(CONTACTS, `${JSON.stringify(data, null, 2)}\n`);
console.log("\n✅ Suite 31/07 terminée — envoie les onglets WA ouverts.");
console.log("Next: push/deploy app (modules + NextStep) si tu veux — dis « push ».");
