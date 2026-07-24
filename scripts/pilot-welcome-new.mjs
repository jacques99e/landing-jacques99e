#!/usr/bin/env node
/**
 * 1) Nudge Armel → 1ère vente
 * 2) Accueillir les boutiques récentes absentes du tracker
 *
 * Usage: node scripts/pilot-welcome-new.mjs
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
const GUIDE = "https://wazo-digital.com/guide-pilote";
const CAISSE = `${APP}/sales`;
const PRODUCTS = `${APP}/products/add`;
const FEEDBACK = "https://wazo-digital.com/feedback";

const NEW_SLUGS = [
  "rach-market",
  "niz",
  "richy-agro",
  "paulasco-store",
  "smartdigital",
  "grace-divine-quincaillerie",
  "boutique-gayet",
  "ebimax",
  "finesse-shop",
  "boutique-asseyi",
  "victor-akadja",
  "kokoroko-digitale",
  "le-bazar",
  "ramatou",
  "accessoirement",
];

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

function firstName(full, fallback) {
  const n = String(full || fallback || "commerçant").trim();
  return n.split(/\s+/)[0];
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
const known = new Set((data.pilots || []).map((p) => String(p.storeSlug || "").toLowerCase()));

console.log("=== 1) Nudge Armel → 1ère vente ===\n");

const armel = (data.pilots || []).find((p) => p.storeSlug === "armel-shop");
if (armel?.email) {
  const text = [
    "Bonjour Armel !",
    "",
    "Vous avez déjà *1 produit* sur ARMEL SHOP — il ne manque que la *1ère vente*.",
    "",
    "Faites-le maintenant (2 minutes) :",
    `1️⃣ Ouvrir la caisse : ${CAISSE}`,
    "2️⃣ Ajouter votre produit → Cash ou MoMo (≥ 200 FCFA)",
    "3️⃣ Valider → partager le reçu WhatsApp",
    "",
    "Astuce : même une vente test à vous-même compte pour démarrer.",
    "",
    `Bloqué ? Capture d'écran ici : ${FEEDBACK}`,
    "",
    "Jacques — Wazo Digital",
  ].join("\n");

  const r = await sendEmail(env, armel.email, "ARMEL SHOP — votre 1ère vente aujourd'hui", text);
  if (r.ok) {
    console.log(`[ok] Armel → ${armel.email} (${r.id})`);
    armel.notes = `Nudge 1ère vente ${today}. ${armel.notes || ""}`.trim();
    armel.lastRelanceAt = today;
    armel.nextRelanceAt = addDays(today, 2);
  } else {
    console.log(`[fail] Armel: ${r.error}`);
  }
} else {
  console.log("[skip] Armel introuvable");
}

console.log("\n=== 2) Accueil nouveaux (15) ===\n");

const { data: stores } = await admin
  .from("stores")
  .select("id, slug, name, whatsapp, phone, owner_id, created_at")
  .in("slug", NEW_SLUGS);

const bySlug = new Map((stores || []).map((s) => [String(s.slug).toLowerCase(), s]));
let welcomed = 0;
let noEmail = 0;

for (const slug of NEW_SLUGS) {
  const store = bySlug.get(slug);
  if (!store) {
    console.log(`## ${slug} [missing]`);
    continue;
  }
  if (known.has(slug)) {
    console.log(`## ${store.name} (${slug}) [déjà tracker]`);
    continue;
  }

  const [{ count: products }, { count: sales }, { data: owner }] = await Promise.all([
    admin.from("products").select("id", { count: "exact", head: true }).eq("store_id", store.id),
    admin.from("sales").select("id", { count: "exact", head: true }).eq("store_id", store.id),
    admin.from("profiles").select("phone, full_name").eq("id", store.owner_id).maybeSingle(),
  ]);

  let email = "";
  try {
    const { data: authUser } = await admin.auth.admin.getUserById(store.owner_id);
    email = authUser?.user?.email || "";
  } catch {
    /* ignore */
  }

  const name = firstName(owner?.full_name, store.name);
  const phone = store.whatsapp || store.phone || owner?.phone || "";
  const boutique = `${APP}/boutique/${store.slug}`;
  const status =
    (products ?? 0) > 0 && (sales ?? 0) > 0
      ? "completed"
      : "active";

  const pilot = {
    id: `organic-${slug}`,
    name: name,
    business: store.name,
    phone: phone || "",
    whatsapp: phone || "",
    email: email || "",
    city: "",
    status,
    invitedAt: today,
    storeSlug: slug,
    lastRelanceAt: email ? today : null,
    nextRelanceAt: addDays(today, 3),
    notes: `Bienvenue organique envoyée ${today}. Créé ${String(store.created_at || "").slice(0, 10)}.`,
    score: { products: products ?? 0, sales: sales ?? 0 },
  };
  if (status === "completed") pilot.completedAt = today;

  data.pilots.push(pilot);
  known.add(slug);

  console.log(
    `## ${store.name} (${slug}) — ${products ?? 0}p/${sales ?? 0}v · email ${email || "—"} · WA ${phone || "—"}`
  );

  if (!email) {
    console.log("   [skip] Pas d'email — ajouté au tracker seulement");
    noEmail += 1;
    continue;
  }

  const text = [
    `Bonjour ${name} ! Bienvenue sur *Wazo Digital* 🎉`,
    "",
    `Merci d'avoir créé *${String(store.name).trim()}*.`,
    "",
    "Pour démarrer en *15 minutes* :",
    `1️⃣ Ajoutez 1 produit : ${PRODUCTS}`,
    `2️⃣ Faites 1 vente test : ${CAISSE}`,
    `3️⃣ Partagez votre vitrine WhatsApp : ${boutique}`,
    "",
    `📖 Guide pas à pas : ${GUIDE}`,
    `📱 App : ${APP}`,
    "",
    "Besoin d'aide ? Répondez à cet email avec une capture d'écran.",
    "",
    "Jacques — Wazo Digital",
  ].join("\n");

  const r = await sendEmail(env, email, `Bienvenue sur Wazo Digital — ${store.name.trim()}`, text);
  if (r.ok) {
    console.log(`   [ok] Email → ${email} (${r.id})`);
    welcomed += 1;
  } else {
    console.log(`   [fail] ${email}: ${r.error}`);
  }
}

data.updatedAt = today;
data.lastSyncedAt = today;
data.lastWelcomeNewAt = today;
data.targetCount = (data.pilots || []).length;
fs.writeFileSync(CONTACTS, `${JSON.stringify(data, null, 2)}\n`);

console.log(`\nTerminé.`);
console.log(`Armel : nudge 1ère vente`);
console.log(`Nouveaux accueillis par email : ${welcomed}`);
console.log(`Nouveaux sans email (tracker seulement) : ${noEmail}`);
console.log(`Tracker : ${data.pilots.length} entrées`);
