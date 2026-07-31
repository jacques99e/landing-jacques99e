#!/usr/bin/env node
/** Prochaine action 29/07 : JosGrace congrats + pitch PRO manquants + WA PRO / 1ère vente */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPTS, "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");
const CONTACTS = path.join(SCRIPTS, "pilot-contacts.json");
const BILLING = "https://app.wazo-digital.com/billing";
const CAISSE = "https://app.wazo-digital.com/sales";
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

// Fix Paulasco
const paul = (data.pilots || []).find((x) => x.storeSlug === "paulasco-store");
if (paul) {
  paul.whatsapp = "2290141914075";
  paul.phone = "2290141914075";
}

console.log("=== 1) JosGrace — félicitations + PRO ===\n");
{
  const p = (data.pilots || []).find((x) => x.storeSlug === "josgrace");
  if (!p) console.log("[missing]");
  else if (String(p.notes || "").includes(`Félicitations ${today}`)) {
    console.log("[déjà félicité]");
  } else {
    const text = [
      `Bonjour ${p.name} !`,
      "",
      "Bravo — *JosGrace* a *1 produit* et *1 vente*. Vous êtes activé sur Wazo Digital 🎉",
      "",
      "Prochaines étapes :",
      "1️⃣ Partagez un reçu / Status WhatsApp",
      `2️⃣ Wazo PRO (9,99 €/mois, MoMo) : ${BILLING}`,
      `3️⃣ Guide : ${GUIDE}`,
      "",
      "Jacques — Wazo Digital",
    ].join("\n");
    if (p.email) {
      const r = await sendEmail(env, p.email, "Bravo JosGrace — parcours pilote réussi 🎉", text);
      console.log(`email — ${r.ok ? `[ok] ${r.id}` : `[fail] ${r.error}`}`);
    }
    const wa = String(p.whatsapp || p.phone || "").replace(/\D/g, "");
    if (wa) {
      openWa(
        wa,
        `Bonjour ! Bravo — *JosGrace* est active (produit + vente). PRO ici : ${BILLING}. Jacques / Wazo Digital`
      );
      console.log(`WA → ${wa}`);
    }
    p.notes = `Félicitations ${today}. Pitch PRO ${today}. ${p.notes || ""}`.trim();
    p.lastRelanceAt = today;
    p.nextRelanceAt = "2026-08-01";
    p.status = "completed";
    await sleep(700);
  }
}

console.log("\n=== 2) Pitch PRO email (completed sans pitch) ===\n");
for (const p of (data.pilots || []).filter((x) => x.status === "completed" && x.email)) {
  if (String(p.email || "").includes("jacquesnoussougan")) {
    console.log(`## ${p.name} [skip test]`);
    continue;
  }
  if (String(p.notes || "").includes("Pitch PRO ")) {
    console.log(`## ${p.name} [déjà pitch]`);
    continue;
  }
  const name = String(p.name || "").split(/\s+/)[0];
  const store = String(p.business || p.name).trim();
  const text = [
    `Bonjour ${name} !`,
    "",
    `Bravo — *${store}* a déjà des ventes sur Wazo Digital.`,
    "",
    "Pour aller plus loin : *Wazo PRO* (rapport hebdo, équipe, modules avancés).",
    "Paiement Mobile Money — 9,99 €/mois.",
    "",
    `→ Activer PRO : ${BILLING}`,
    "",
    "Le plan gratuit reste disponible.",
    "",
    "Jacques — Wazo Digital",
  ].join("\n");
  try {
    const r = await sendEmail(env, p.email, `${store} — passer à Wazo PRO ?`, text);
    console.log(`## ${p.name} — ${r.ok ? `[ok] ${r.id}` : `[fail] ${r.error}`}`);
    if (r.ok) {
      p.notes = `Pitch PRO ${today}. ${p.notes || ""}`.trim();
      p.lastRelanceAt = today;
      p.nextRelanceAt = "2026-08-01";
    }
    await sleep(800);
  } catch (e) {
    console.log(`## ${p.name} [error] ${e.message || e}`);
  }
}

console.log("\n=== 3) Relance PRO WA (completed avec numéro, pas encore WA PRO aujourd'hui) ===\n");
const proWaTargets = ["paulasco-store", "finesse-shop", "josgrace", "ariolstore", "le-paysan-sarl", "charity-shop"];
for (const slug of proWaTargets) {
  const p = (data.pilots || []).find((x) => x.storeSlug === slug);
  if (!p || p.status !== "completed") continue;
  if (String(p.notes || "").includes(`Pitch PRO WA ${today}`)) {
    console.log(`## ${p.name} [WA PRO déjà]`);
    continue;
  }
  // josgrace already opened above with PRO in same message
  if (slug === "josgrace" && String(p.notes || "").includes(`Félicitations ${today}`)) {
    p.notes = `Pitch PRO WA ${today}. ${p.notes || ""}`.trim();
    console.log(`## JosGrace [inclus dans congrats WA]`);
    continue;
  }
  const wa = String(p.whatsapp || p.phone || "").replace(/\D/g, "");
  if (wa.length < 8) continue;
  const msg = [
    `Bonjour ${p.name} !`,
    `Bravo pour *${String(p.business || p.name).trim()}*.`,
    `Wazo PRO (9,99 €/mois MoMo) : ${BILLING}`,
    "Jacques / Wazo Digital",
  ].join(" ");
  if (openWa(wa, msg)) {
    console.log(`## ${p.name} WA PRO → ${wa}`);
    p.notes = `Pitch PRO WA ${today}. ${p.notes || ""}`.trim();
    await sleep(650);
  }
}

console.log("\n=== 4) WA 1ère vente (chauds) ===\n");
for (const slug of ["ong-weziza-africa", "lumiforce", "ange-beugre-academy", "ebimax"]) {
  const p = (data.pilots || []).find((x) => x.storeSlug === slug);
  if (!p) continue;
  if ((p.score?.sales || 0) > 0) continue;
  if (String(p.notes || "").includes(`Nudge 1ere vente WA ${today}`)) {
    console.log(`## ${p.name} [déjà]`);
    continue;
  }
  const wa = String(p.whatsapp || p.phone || "").replace(/\D/g, "");
  if (wa.length < 8) continue;
  const msg = `Bonjour ${p.name} ! *${String(p.business || p.name).trim()}* a déjà un produit. 1ère vente (2 min) : ${CAISSE}. Jacques / Wazo Digital`;
  if (openWa(wa, msg)) {
    console.log(`## ${p.name} WA vente → ${wa}`);
    p.notes = `Nudge 1ere vente WA ${today}. ${p.notes || ""}`.trim();
    await sleep(650);
  }
}

data.updatedAt = today;
fs.writeFileSync(CONTACTS, `${JSON.stringify(data, null, 2)}\n`);
console.log("\nTerminé — focus PRO + activation.");
