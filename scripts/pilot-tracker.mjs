#!/usr/bin/env node
/**
 * Suivi des commerçants pilotes + liens WhatsApp personnalisés.
 *
 * Usage:
 *   node scripts/pilot-tracker.mjs list
 *   node scripts/pilot-tracker.mjs add "Nom" "+22177..." "Commerce"
 *   node scripts/pilot-tracker.mjs invite pilot-2
 *   node scripts/pilot-tracker.mjs relance
 *   node scripts/pilot-tracker.mjs sync   # croise avec Supabase (si clés dans .env.local)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(ROOT, "pilot-contacts.json");
const GUIDE = "https://wazo-digital.com/guide-pilote";
const REGISTER = "https://wazo-digital.com/register";

const MESSAGES = {
  invitation: (name) =>
    [
      `Bonjour${name ? ` ${name.split(" ")[0]}` : ""} ! Voici votre guide pour démarrer sur *Wazo Digital* en pilote 🚀`,
      "",
      `1️⃣ Inscription : ${REGISTER}`,
      "2️⃣ Ajoutez vos produits puis ouvrez la *Caisse*",
      "3️⃣ Partagez votre catalogue WhatsApp depuis *Produits*",
      "4️⃣ Installez l'app sur l'écran d'accueil (PWA)",
      "",
      `Guide complet : ${GUIDE}`,
      "",
      "Une question ? Répondez à ce message.",
    ].join("\n"),

  relance: (name) =>
    [
      `Bonjour${name ? ` ${name.split(" ")[0]}` : ""} ! Petit rappel pour votre test *Wazo Digital* 🙏`,
      "",
      "Avez-vous pu :",
      "✅ Créer votre compte",
      "✅ Ajouter 1 produit",
      "✅ Faire 1 vente à la caisse",
      "",
      `Guide : ${GUIDE}`,
      "Un blocage ? Répondez ici avec une capture d'écran.",
    ].join("\n"),
};

function load() {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
}

function save(data) {
  data.updatedAt = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`);
}

function waLink(phone, text) {
  const digits = String(phone).replace(/\D/g, "");
  const base = digits ? `https://wa.me/${digits}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(text)}`;
}

function list(data) {
  console.log(`=== Pilotes (${data.pilots.length}/${data.targetCount} cibles) ===\n`);
  for (const p of data.pilots) {
    const label = p.name || "(vide)";
    const contact = p.whatsapp || p.phone || "—";
    console.log(`${p.id}  [${p.status}]  ${label}  ${contact}`);
    if (p.business) console.log(`       activité: ${p.business}${p.city ? ` · ${p.city}` : ""}`);
    if (p.storeSlug) console.log(`       boutique: /boutique/${p.storeSlug}`);
    if (p.notes) console.log(`       note: ${p.notes}`);
  }
  const prospects = data.pilots.filter((p) => p.status === "prospect" && p.name && !p.name.startsWith("[À compléter]"));
  const needRelance = data.pilots.filter((p) => p.status === "invited");
  console.log(`\nÀ inviter (nom renseigné) : ${prospects.length}`);
  console.log(`En attente inscription : ${needRelance.length}`);
}

function addPilot(data, name, phone, business = "") {
  const slot =
    data.pilots.find((p) => p.name?.startsWith("[À compléter]")) ||
    data.pilots.find((p) => !p.name);
  if (!slot) {
    console.error("Plus de slot pilote — augmentez targetCount dans pilot-contacts.json");
    process.exit(1);
  }
  slot.name = name;
  slot.phone = phone;
  slot.whatsapp = phone;
  if (business) slot.business = business;
  slot.status = "prospect";
  save(data);
  console.log(`[ok] ${slot.id} : ${name} (${phone})`);
}

function invite(data, id, type = "invitation") {
  const pilot = data.pilots.find((p) => p.id === id);
  if (!pilot?.name || pilot.name.startsWith("[À compléter]")) {
    console.error(`Pilote ${id} : remplacez le nom placeholder et ajoutez un numéro WhatsApp avant d'inviter.`);
    console.error(`  npm run pilot:tracker add "Vrai nom" "+221..." "${pilot?.business || ""}"`);
    process.exit(1);
  }
  const text = MESSAGES[type](pilot.name);
  console.log(`--- ${type} → ${pilot.name} ---\n`);
  console.log(text);
  console.log(`\n--- WhatsApp ---\n${waLink(pilot.whatsapp || pilot.phone, text)}`);
  if (type === "invitation" && pilot.status === "prospect") {
    pilot.status = "invited";
    pilot.invitedAt = new Date().toISOString().slice(0, 10);
    save(data);
  }
}

function relanceAll(data) {
  const targets = data.pilots.filter((p) => ["invited", "active"].includes(p.status) && p.name);
  if (!targets.length) {
    console.log("Aucun pilote à relancer.");
    return;
  }
  for (const p of targets) {
    console.log(`\n=== ${p.name} (${p.status}) ===`);
    const text = MESSAGES.relance(p.name);
    console.log(waLink(p.whatsapp || p.phone, text));
  }
}

async function syncSupabase(data) {
  let createClient;
  try {
    ({ createClient } = await import("@supabase/supabase-js"));
  } catch {
    console.log("[skip] @supabase/supabase-js non installé dans Landing");
    return;
  }

  function loadEnv() {
    const paths = [
      path.join(ROOT, "..", ".env.local"),
      path.join(ROOT, "..", "..", "wazo-digital", ".env.local"),
    ];
    const out = {};
    for (const envPath of paths) {
      if (!fs.existsSync(envPath)) continue;
      for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
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

  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.log("[skip] sync Supabase — ajoutez SUPABASE_SERVICE_ROLE_KEY dans Landing/.env.local");
    return;
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const { data: stores } = await admin
    .from("stores")
    .select("name, slug, created_at")
    .order("created_at", { ascending: false });

  const real = (stores || []).filter((s) => !String(s.slug).includes("test-roles"));
  console.log(`\nBoutiques cloud (hors test): ${real.length}`);
  for (const s of real) {
    console.log(`  · ${s.name} (${s.slug})`);
    let pilot = data.pilots.find((p) => p.storeSlug === s.slug);
    if (!pilot) {
      pilot = data.pilots.find((p) => !p.name);
      if (pilot) {
        pilot.name = s.name;
        pilot.storeSlug = s.slug;
        pilot.status = "active";
      }
    }
  }
  save(data);
  console.log("[ok] pilot-contacts.json synchronisé");
}

function board(data) {
  console.log("=== Tableau de bord pilotes ===\n");
  list(data);
  console.log("\n--- Actions recommandées ---");
  const activeNoSale = data.pilots.filter((p) => p.status === "active");
  if (activeNoSale.length) {
    console.log(`• Relance vente : ${activeNoSale.map((p) => p.name).join(", ")} → npm run pilot:tracker relance`);
  }
  const placeholders = data.pilots.filter((p) => p.name?.startsWith("[À compléter]"));
  if (placeholders.length) {
    console.log(`• ${placeholders.length} profil(s) type à remplacer par de vrais contacts (pilot:tracker add)`);
  }
  const readyInvite = data.pilots.filter(
    (p) => p.status === "prospect" && p.name && !p.name.startsWith("[À compléter]") && (p.whatsapp || p.phone)
  );
  for (const p of readyInvite) {
    console.log(`• Inviter ${p.id} ${p.name} → npm run pilot:tracker invite ${p.id}`);
  }
  console.log(`• Post réseaux → npm run launch:social register`);
}

const [cmd, ...args] = process.argv.slice(2);
const data = load();

switch (cmd || "list") {
  case "list":
    list(data);
    break;
  case "board":
    board(data);
    break;
  case "add":
    addPilot(data, args[0], args[1], args[2] || "");
    break;
  case "invite":
    invite(data, args[0], args[1] || "invitation");
    break;
  case "relance":
    relanceAll(data);
    break;
  case "sync":
    await syncSupabase(data);
    list(load());
    break;
  default:
    console.log("Commandes: list | board | add | invite <id> | relance | sync");
    process.exit(1);
}
