#!/usr/bin/env node
/**
 * Suite post-accueil :
 * - Nudge 1ère vente pour nouveaux avec produits mais 0 vente
 * - Félicitations + feedback pour ceux déjà avec ventes
 *
 * Usage: node scripts/pilot-nudge-new-sales.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPTS, "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");
const CONTACTS = path.join(SCRIPTS, "pilot-contacts.json");
const APP = "https://app.wazo-digital.com";
const CAISSE = `${APP}/sales`;
const FEEDBACK = "https://wazo-digital.com/feedback";
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

function addDays(isoDate, days) {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const env = loadEnv();
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const data = JSON.parse(fs.readFileSync(CONTACTS, "utf8"));
const today = new Date().toISOString().slice(0, 10);

const organics = (data.pilots || []).filter((p) => String(p.id || "").startsWith("organic-"));
const slugs = organics.map((p) => p.storeSlug).filter(Boolean);

const { data: stores } = await admin
  .from("stores")
  .select("id, slug, name")
  .in("slug", slugs);
const bySlug = new Map((stores || []).map((s) => [String(s.slug).toLowerCase(), s]));

let nudged = 0;
let congrats = 0;

console.log("=== Suite nouveaux : 1ère vente / félicitations ===\n");

for (const p of organics) {
  const store = bySlug.get(String(p.storeSlug || "").toLowerCase());
  if (!store) continue;

  const [{ count: products }, { count: sales }] = await Promise.all([
    admin.from("products").select("id", { count: "exact", head: true }).eq("store_id", store.id),
    admin.from("sales").select("id", { count: "exact", head: true }).eq("store_id", store.id),
  ]);

  p.score = { products: products ?? 0, sales: sales ?? 0 };
  const name = String(p.name || store.name).split(/\s+/)[0];
  const boutique = `${APP}/boutique/${store.slug}`;

  if ((sales ?? 0) > 0) {
    if (p.status !== "completed") {
      p.status = "completed";
      p.completedAt = p.completedAt || today;
    }
    if (!p.email) {
      console.log(`## ${store.name} — ${products}p/${sales}v [completed, no email]`);
      continue;
    }
    // Skip if we already sent congrats today
    if (String(p.notes || "").includes(`Félicitations ${today}`)) {
      console.log(`## ${store.name} — déjà félicité aujourd'hui`);
      continue;
    }
    const text = [
      `Bonjour ${name} !`,
      "",
      `🎉 Bravo — *${String(store.name).trim()}* a déjà *${sales} vente(s)* sur Wazo Digital.`,
      "",
      "Prochaine étape utile :",
      `→ Partager votre vitrine WhatsApp Status : ${boutique}`,
      `→ Dire ce qui marche / manque (2 min) : ${FEEDBACK}`,
      "",
      `Guide : ${GUIDE}`,
      "",
      "Jacques — Wazo Digital",
    ].join("\n");
    const r = await sendEmail(
      env,
      p.email,
      `Bravo ${store.name.trim()} — ${sales} vente(s) sur Wazo`,
      text
    );
    console.log(`## ${store.name} — ${products}p/${sales}v [congrats]`);
    if (r.ok) {
      console.log(`   [ok] ${p.email} (${r.id})`);
      p.notes = `Félicitations ${today}. ${p.notes || ""}`.trim();
      p.lastRelanceAt = today;
      p.nextRelanceAt = addDays(today, 5);
      congrats += 1;
    } else console.log(`   [fail] ${r.error}`);
    continue;
  }

  if ((products ?? 0) > 0 && (sales ?? 0) === 0) {
    if (!p.email) {
      console.log(`## ${store.name} — ${products}p/0v [nudge skip, no email]`);
      continue;
    }
    if (String(p.notes || "").includes(`Nudge 1ère vente ${today}`)) {
      console.log(`## ${store.name} — déjà nudgé aujourd'hui`);
      continue;
    }
    const text = [
      `Bonjour ${name} !`,
      "",
      `Vous avez déjà *${products} produit(s)* sur *${String(store.name).trim()}*.`,
      "Il reste la *1ère vente* pour démarrer vraiment.",
      "",
      "Objectif aujourd'hui (2 min) :",
      `1️⃣ Ouvrir la caisse : ${CAISSE}`,
      "2️⃣ Ajouter un produit → Cash ou MoMo (≥ 200 FCFA)",
      "3️⃣ Valider → partager le reçu WhatsApp",
      "",
      "Astuce : une vente test à vous-même suffit pour commencer.",
      "",
      `Bloqué ? ${FEEDBACK}`,
      "",
      "Jacques — Wazo Digital",
    ].join("\n");
    const r = await sendEmail(
      env,
      p.email,
      `${store.name.trim()} — 1ère vente en 2 minutes`,
      text
    );
    console.log(`## ${store.name} — ${products}p/0v [nudge vente]`);
    if (r.ok) {
      console.log(`   [ok] ${p.email} (${r.id})`);
      p.notes = `Nudge 1ère vente ${today}. ${p.notes || ""}`.trim();
      p.lastRelanceAt = today;
      p.nextRelanceAt = addDays(today, 2);
      nudged += 1;
    } else console.log(`   [fail] ${r.error}`);
    continue;
  }

  console.log(`## ${store.name} — ${products}p/${sales}v [attente produit]`);
}

data.updatedAt = today;
fs.writeFileSync(CONTACTS, `${JSON.stringify(data, null, 2)}\n`);
console.log(`\nTerminé — nudges 1ère vente: ${nudged} · félicitations: ${congrats}`);
