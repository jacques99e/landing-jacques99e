#!/usr/bin/env node
/**
 * Actions pilotes personnalisées (données Supabase + audit).
 * Usage:
 *   node scripts/pilot-actions.mjs relance
 *   node scripts/pilot-actions.mjs welcome [slug...]
 *   node scripts/pilot-actions.mjs outreach   # accueil nouveaux + relance actifs
 *   node scripts/pilot-actions.mjs audit
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const WAZO = path.join(ROOT, "..", "..", "wazo-digital");
const GUIDE = "https://wazo-digital.com/guide-pilote";
const APP = "https://app.wazo-digital.com";
const REGISTER = "https://wazo-digital.com/register";

function loadEnv() {
  const envPath = path.join(WAZO, ".env.local");
  const out = {};
  if (!fs.existsSync(envPath)) return out;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (v) out[t.slice(0, i).trim()] = v;
  }
  return out;
}

function normalizePhoneForWa(raw) {
  let digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("221") || digits.startsWith("225") || digits.startsWith("228")) return digits;
  if (digits.length === 9 && digits.startsWith("7")) return `221${digits}`;
  if (digits.length === 8) return `228${digits}`;
  return digits;
}

function waLink(phone, text) {
  const digits = normalizePhoneForWa(phone);
  const base = digits ? `https://wa.me/${digits}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(text)}`;
}

function mailtoLink(email, subject, body) {
  if (!email) return null;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function firstName(owner, store) {
  return (owner?.full_name || store.name).trim().split(/\s+/)[0];
}

function buildWelcomeMessage({ store, products, sales, boutique, caisse, name }) {
  const storeLabel = String(store.name).trim();
  const lines = [
    `Bonjour ${name} ! Bienvenue sur *Wazo Digital* 🎉`,
    "",
    `Merci d'avoir créé votre boutique *${storeLabel}*.`,
    "",
    "Pour démarrer en *15 minutes* :",
    `1️⃣ Ajoutez 3 produits → ${APP}/products/add`,
    `2️⃣ Faites 1 vente test → ${caisse}`,
    `3️⃣ Partagez votre vitrine WhatsApp → ${boutique}`,
    "",
    `📖 Guide pas à pas : ${GUIDE}`,
    `📱 App : ${APP}`,
    "",
    "Je reste disponible — bloqué ? Envoyez une capture d'écran ici.",
  ];
  if ((products ?? 0) === 0) {
    lines.splice(8, 0, "💡 Commencez par *1 produit* que vous vendez tous les jours.");
  }
  return lines.join("\n");
}

function buildRelanceMessage({ store, products, sales, noPhoto, boutique, caisse, name }) {
  const lines = [`Bonjour ${name} ! Suivi rapide *Wazo Digital* 🙏`, ""];

  if ((products ?? 0) === 0) {
    lines.push("Votre boutique est créée mais *aucun produit* pour l'instant 📦");
    lines.push("");
    lines.push("Objectif *aujourd'hui* :");
    lines.push(`→ Ajouter 1 produit : ${APP}/products/add`);
    lines.push(`→ Faire 1 vente test : ${caisse}`);
    lines.push("");
  } else if ((sales ?? 0) === 0) {
    lines.push("Objectif cette semaine : *1 vente à la caisse*");
    lines.push(`→ Ouvrir la caisse : ${caisse}`);
    lines.push("→ Ajouter un article → Finaliser → Partager le reçu WhatsApp");
    lines.push("");
  } else {
    lines.push(`🎉 Bravo — *${sales} vente(s)* enregistrée(s) !`);
    lines.push("Prochaine étape : partagez votre vitrine sur *WhatsApp Status*.");
    lines.push("");
  }

  if (noPhoto?.length) {
    lines.push(
      `📷 ${noPhoto.length}+ produit(s) sans photo — ajoutez une image depuis *Produits*.`
    );
    lines.push("");
  }

  lines.push(`Votre vitrine : ${boutique}`);
  lines.push(`Guide : ${GUIDE}`);
  lines.push("Une difficulté ? Répondez avec une capture d'écran.");
  return lines.join("\n");
}

function printOutreach({ store, owner, email, contact, products, sales, text, mode }) {
  console.log(`## ${store.name} (${store.slug}) [${mode}]`);
  console.log(
    `   produits: ${products ?? 0} · ventes: ${sales ?? 0} · tel: ${contact || "—"} · email: ${email || "—"}`
  );
  console.log("\n" + text);

  if (contact) {
    console.log("\nWhatsApp:", waLink(contact, text));
  } else {
    console.log("\nWhatsApp (coller le numéro du client):", waLink("", text));
  }

  const subject =
    mode === "welcome"
      ? `Bienvenue sur Wazo Digital — ${store.name}`
      : `Suivi Wazo Digital — ${store.name}`;
  const mail = mailtoLink(email, subject, text);
  if (mail) {
    console.log("Email:", mail);
  } else {
    console.log("Email: — (demandez le WhatsApp ou l'email au client)");
  }
  console.log("");
}

async function loadStoreBundle(admin, store) {
  const [{ count: products }, { count: sales }, { data: noPhoto }] = await Promise.all([
    admin.from("products").select("id", { count: "exact", head: true }).eq("store_id", store.id),
    admin.from("sales").select("id", { count: "exact", head: true }).eq("store_id", store.id),
    admin
      .from("products")
      .select("name")
      .eq("store_id", store.id)
      .is("photo_url", null)
      .limit(3),
  ]);

  const { data: owner } = await admin
    .from("profiles")
    .select("phone, full_name")
    .eq("id", store.owner_id)
    .maybeSingle();

  let email = "";
  try {
    const { data: authUser } = await admin.auth.admin.getUserById(store.owner_id);
    email = authUser?.user?.email || "";
  } catch {
    /* ignore */
  }

  const contact = store.whatsapp || store.phone || owner?.phone || "";
  const boutique = `${APP}/boutique/${store.slug}`;
  const caisse = `${APP}/sales`;
  const name = firstName(owner, store);

  return { products, sales, noPhoto, owner, email, contact, boutique, caisse, name };
}

async function main() {
  const cmd = process.argv[2]?.trim() || "relance";
  const slugFilter = process.argv.slice(3).map((s) => s.trim().toLowerCase()).filter(Boolean);

  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Clés Supabase manquantes (wazo-digital/.env.local)");
    process.exit(1);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(url, key, { auth: { persistSession: false } });

  const { data: stores } = await admin
    .from("stores")
    .select("id, slug, name, whatsapp, phone, owner_id, created_at")
    .order("created_at", { ascending: false });

  let real = (stores || []).filter((s) => !String(s.slug).includes("test-roles"));

  if (slugFilter.length) {
    real = real.filter((s) => slugFilter.includes(String(s.slug).toLowerCase()));
  }

  const today = new Date().toISOString().slice(0, 10);
  const welcomeSlugs = new Set(["manthus", "mewe-farms"]);
  const relanceSlugs = new Set(["espoir", "balade-estivale"]);

  console.log(`=== Pilotes (${real.length}) — commande: ${cmd} ===\n`);

  for (const store of real) {
    const bundle = await loadStoreBundle(admin, store);

    if (cmd === "audit") {
      console.log(
        `## ${store.name} (${store.slug}) — ${bundle.products ?? 0} produits, ${bundle.sales ?? 0} ventes`
      );
      continue;
    }

    let mode = "relance";
    if (cmd === "welcome") {
      mode = "welcome";
    } else if (cmd === "outreach") {
      const createdToday = String(store.created_at || "").startsWith(today);
      if (welcomeSlugs.has(store.slug) || createdToday) mode = "welcome";
      else if (relanceSlugs.has(store.slug)) mode = "relance";
      else continue;
    } else if (cmd === "relance" && slugFilter.length === 0) {
      mode = "relance";
    } else if (cmd === "relance") {
      mode = "relance";
    }

    const text =
      mode === "welcome"
        ? buildWelcomeMessage({ store, ...bundle })
        : buildRelanceMessage({ store, ...bundle });

    printOutreach({ store, ...bundle, text, mode });
  }

  if (cmd === "audit") {
    const r = spawnSync("npm", ["run", "audit:cloud"], { cwd: WAZO, stdio: "inherit", shell: true });
    process.exit(r.status ?? 0);
  }

  if (cmd === "outreach") {
    console.log("--- Rappel ---");
    console.log("• Manthus / Mewe farms : pas de WhatsApp en base → utilisez Email ou demandez le numéro");
    console.log("• Balade Estivale : WhatsApp 93924040 (Togo +228)");
    console.log(`• Inscription : ${REGISTER}`);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
