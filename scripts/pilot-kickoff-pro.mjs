#!/usr/bin/env node
/**
 * Kickoff monétisation PRO — completed + Espoir (expired PRO).
 * Usage: node scripts/pilot-kickoff-pro.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPTS, "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");
const CONTACTS = path.join(SCRIPTS, "pilot-contacts.json");
const BILLING = "https://app.wazo-digital.com/billing?plan=pro&pay=1";
const BILLING_PAGE = "https://app.wazo-digital.com/billing";
const CAMPAIGN = "Kickoff PRO 2026-08-26";

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

console.log(`=== ${CAMPAIGN} ===\n`);

// 1) Completed — email + WA
const completed = (data.pilots || []).filter((p) => p.status === "completed");
for (const p of completed) {
  if (String(p.notes || "").includes(CAMPAIGN)) {
    console.log(`## ${p.name} [skip déjà]`);
    continue;
  }
  if (String(p.email || "").includes("jacquesnoussougan")) {
    console.log(`## ${p.name} [skip test]`);
    continue;
  }

  const name = String(p.name || "commerçant").split(/\s+/)[0];
  const store = String(p.business || p.name).trim();
  const sales = p.score?.sales ?? "?";
  const text = [
    `Bonjour ${name} !`,
    "",
    `Vous utilisez déjà Wazo avec succès (*${store}* — ${sales} vente(s)). Bravo 👏`,
    "",
    "*Wazo PRO* débloque :",
    "• Produits illimités",
    "• Analytics & exports PDF",
    "• Jusqu'à 3 boutiques",
    "",
    "9,99 €/mois (~6 550 FCFA) via Mobile Money — sans engagement.",
    "",
    `→ Activer PRO en 1 clic : ${BILLING}`,
    "",
    "Le Starter reste gratuit si vous préférez attendre.",
    "",
    "Jacques — Wazo Digital",
  ].join("\n");

  if (p.email) {
    const r = await sendEmail(env, p.email, `${store} — activez Wazo PRO (MoMo)`, text);
    console.log(`## ${p.name} email — ${r.ok ? `[ok] ${r.id}` : `[fail] ${r.error}`}`);
    await sleep(700);
  } else {
    console.log(`## ${p.name} email — [pas d'email]`);
  }

  const wa = String(p.whatsapp || p.phone || "").replace(/\D/g, "");
  if (wa.length >= 8) {
    openWa(
      wa,
      `Bonjour ${name} ! *${store}* tourne bien sur Wazo. PRO (9,99 €/mois MoMo) : produits illimités + analytics. Activer : ${BILLING}. Jacques / Wazo Digital`
    );
    console.log(`## ${p.name} WA → ${wa}`);
    await sleep(650);
  }

  p.notes = `${CAMPAIGN}. ${p.notes || ""}`.trim();
  p.lastRelanceAt = today;
  p.nextRelanceAt = "2026-09-02";
}

// 2) Espoir — expired PRO, reactivation directe
console.log("\n=== Espoir — réactivation PRO ===\n");
{
  const p = (data.pilots || []).find((x) => x.storeSlug === "espoir");
  if (p && !String(p.notes || "").includes(`${CAMPAIGN} Espoir`)) {
    const text = [
      "Bonjour Espoir !",
      "",
      "Votre essai *Wazo PRO* a expiré — vous pouvez le réactiver en 2 minutes :",
      "",
      `→ ${BILLING}`,
      "",
      "Ou voir les plans : " + BILLING_PAGE,
      "",
      "Besoin d'aide pour ajouter votre 1er produit ? Répondez ici.",
      "",
      "Jacques — Wazo Digital",
    ].join("\n");
    if (p.email) {
      const r = await sendEmail(env, p.email, "Espoir — réactivez Wazo PRO (MoMo)", text);
      console.log(`email — ${r.ok ? `[ok] ${r.id}` : `[fail] ${r.error}`}`);
    }
    p.notes = `${CAMPAIGN} Espoir. ${p.notes || ""}`.trim();
    p.lastRelanceAt = today;
  } else {
    console.log("[skip Espoir]");
  }
}

data.updatedAt = today;
fs.writeFileSync(CONTACTS, `${JSON.stringify(data, null, 2)}\n`);
console.log(`\n✅ ${CAMPAIGN} terminé — envoie les onglets WA.`);
