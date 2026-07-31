#!/usr/bin/env node
/**
 * Suite 28/07 — reprendre relances coupées + WA 1ère vente + congrats Le Paysan
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPTS, "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");
const CONTACTS = path.join(SCRIPTS, "pilot-contacts.json");
const APP = "https://app.wazo-digital.com";
const CAISSE = `${APP}/sales`;
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

const env = loadEnv();
const data = JSON.parse(fs.readFileSync(CONTACTS, "utf8"));
const today = new Date().toISOString().slice(0, 10);

// Slugs cut off when followup crashed (gayet onwards) + a few still due
const RESUME_SLUGS = [
  "boutique-gayet",
  "ebimax",
  "boutique-asseyi",
  "accessoirement",
  "armel-shop",
  "richy-agro",
  "boutique-des-ventes-des-produits-spirituels",
  "christ-est-roi",
  "fast-foot",
  "boutique-ouzeshop",
];

console.log("=== 1) Reprise relances coupées ===\n");

for (const slug of RESUME_SLUGS) {
  const p = (data.pilots || []).find((x) => x.storeSlug === slug);
  if (!p?.email) {
    console.log(`## ${slug} [skip]`);
    continue;
  }
  if (String(p.notes || "").includes(`Relance email ${today}`) || String(p.notes || "").includes(`Relance ${today}`)) {
    console.log(`## ${p.name} [déjà relancé aujourd'hui]`);
    continue;
  }
  const prod = p.score?.products || 0;
  const sales = p.score?.sales || 0;
  let subject = `${p.business || p.name} — on avance ensemble`;
  let text;
  if (prod >= 1 && sales === 0) {
    subject = `${p.business || p.name} — 1ère vente en 2 minutes`;
    text = [
      `Bonjour ${p.name} !`,
      "",
      `Vous avez déjà *${prod} produit(s)*. Il reste la *1ère vente*.`,
      "",
      `1️⃣ Caisse : ${CAISSE}`,
      "2️⃣ Cash ou MoMo (≥ 200 FCFA)",
      "3️⃣ Valider → partager le reçu WhatsApp",
      "",
      `Guide : ${GUIDE}`,
      "",
      "Jacques — Wazo Digital",
    ].join("\n");
  } else if (prod === 0) {
    subject = `${p.business || p.name} — ajoutez 1 produit aujourd'hui`;
    text = [
      `Bonjour ${p.name} !`,
      "",
      "Votre boutique est créée. Objectif aujourd'hui (3 min) :",
      `1️⃣ Ajouter 1 produit : ${PRODUCTS}`,
      `2️⃣ Faire 1 vente test : ${CAISSE}`,
      "",
      `Guide : ${GUIDE}`,
      "",
      "Jacques — Wazo Digital",
    ].join("\n");
  } else {
    text = [
      `Bonjour ${p.name} !`,
      "",
      "Petit rappel Wazo Digital — on est là pour vous aider à vendre.",
      `Caisse : ${CAISSE}`,
      `Guide : ${GUIDE}`,
      "",
      "Jacques — Wazo Digital",
    ].join("\n");
  }

  try {
    const r = await sendEmail(env, p.email, subject, text);
    console.log(`## ${p.name} — ${r.ok ? `[ok] ${r.id}` : `[fail] ${r.error}`}`);
    if (r.ok) {
      p.notes = `Relance email ${today}. ${p.notes || ""}`.trim();
      p.lastRelanceAt = today;
      p.nextRelanceAt = "2026-07-31";
      fs.writeFileSync(CONTACTS, `${JSON.stringify(data, null, 2)}\n`);
    }
    await sleep(800);
  } catch (e) {
    console.log(`## ${p.name} [error] ${e.message || e}`);
    await sleep(1500);
  }
}

console.log("\n=== 2) WhatsApp 1ère vente (numéros connus) ===\n");

const hotWa = (data.pilots || []).filter((p) => {
  const prod = p.score?.products || 0;
  const sales = p.score?.sales || 0;
  const wa = String(p.whatsapp || p.phone || "").replace(/\D/g, "");
  return prod >= 1 && sales === 0 && wa.length >= 8;
});

for (const p of hotWa) {
  if (String(p.notes || "").includes(`Nudge 1ere vente WA ${today}`)) {
    console.log(`## ${p.name} [WA déjà ouvert]`);
    continue;
  }
  const wa = String(p.whatsapp || p.phone || "").replace(/\D/g, "");
  const msg = [
    `Bonjour ${p.name} !`,
    `*${(p.business || p.name).trim()}* a déjà ${p.score.products} produit(s).`,
    `Il reste la *1ère vente* (2 min) : ${CAISSE}`,
    "(Cash ou MoMo ≥ 200 FCFA).",
    "Jacques / Wazo Digital",
  ].join(" ");
  if (openWa(wa, msg)) {
    console.log(`## ${p.name} WA → ${wa}`);
    p.notes = `Nudge 1ere vente WA ${today}. ${p.notes || ""}`.trim();
    await sleep(600);
  }
}

console.log("\n=== 3) Email Le Paysan (retry) ===\n");
{
  const p = (data.pilots || []).find((x) => x.storeSlug === "le-paysan-sarl");
  if (p?.email && !String(p.notes || "").includes(`Félicitations email ${today}`)) {
    const text = [
      `Bonjour ${p.name} !`,
      "",
      "Bravo — *Le Paysan SARL* a *2 produits* et *2 ventes*. Excellent démarrage.",
      "",
      `PRO : ${BILLING}`,
      `Guide : ${GUIDE}`,
      "",
      "Jacques — Wazo Digital",
    ].join("\n");
    try {
      const r = await sendEmail(
        env,
        p.email,
        "Bravo Le Paysan SARL — 2 produits, 2 ventes",
        text
      );
      console.log(`## Le Paysan — ${r.ok ? `[ok] ${r.id}` : `[fail] ${r.error}`}`);
      if (r.ok) {
        p.notes = `Félicitations email ${today}. ${p.notes || ""}`.trim();
        p.lastRelanceAt = today;
      }
    } catch (e) {
      console.log(`## Le Paysan [error] ${e.message || e}`);
    }
  } else {
    console.log("## Le Paysan [skip]");
  }
}

console.log("\n=== 4) PRO pitch WA (completed avec numéro) ===\n");
const completedWa = (data.pilots || []).filter((p) => {
  const wa = String(p.whatsapp || p.phone || "").replace(/\D/g, "");
  return p.status === "completed" && wa.length >= 10 && !(String(p.notes || "").includes(`Pitch PRO WA ${today}`));
});

// Limit to 3 tonight to avoid spam: Ariol, Le Paysan, Charity (freshest)
const pitchSlugs = new Set(["ariolstore", "le-paysan-sarl", "charity-shop"]);
for (const p of completedWa.filter((x) => pitchSlugs.has(x.storeSlug))) {
  const wa = String(p.whatsapp || p.phone || "").replace(/\D/g, "");
  const msg = [
    `Bonjour ${p.name} !`,
    `Bravo pour *${(p.business || p.name).trim()}* sur Wazo.`,
    `Pour aller plus loin (stock avancé, analytics) : plan PRO → ${BILLING}`,
    "Jacques / Wazo Digital",
  ].join(" ");
  if (openWa(wa, msg)) {
    console.log(`## PRO ${p.name} WA → ${wa}`);
    p.notes = `Pitch PRO WA ${today}. ${p.notes || ""}`.trim();
    await sleep(700);
  }
}

// Paulasco WA lock
const paul = (data.pilots || []).find((x) => x.storeSlug === "paulasco-store");
if (paul) {
  paul.whatsapp = "2290141914075";
  paul.phone = "2290141914075";
}

data.updatedAt = today;
fs.writeFileSync(CONTACTS, `${JSON.stringify(data, null, 2)}\n`);
console.log("\nTerminé — suite 28/07.");
