#!/usr/bin/env node
/**
 * Actions pilotes personnalisées (données Supabase + audit).
 * Usage: node scripts/pilot-actions.mjs [relance|audit]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const WAZO = path.join(ROOT, "..", "..", "wazo-digital");
const GUIDE = "https://wazo-digital.com/guide-pilote";
const APP = "https://app.wazo-digital.com";

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
  if (digits.startsWith("221") || digits.startsWith("225")) return digits;
  if (digits.length === 9 && digits.startsWith("7")) return `221${digits}`;
  if (digits.length === 8) return `2217${digits}`;
  return digits;
}

function waLink(phone, text) {
  const digits = normalizePhoneForWa(phone);
  const base = digits ? `https://wa.me/${digits}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(text)}`;
}

async function main() {
  const cmd = process.argv[2]?.trim() || "relance";
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
    .select("id, slug, name, whatsapp, phone, owner_id")
    .order("created_at", { ascending: false });

  const real = (stores || []).filter((s) => !String(s.slug).includes("test-roles"));
  console.log(`=== Pilotes réels (${real.length}) ===\n`);

  for (const store of real) {
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

    const contact = store.whatsapp || store.phone || owner?.phone || "";
    const boutique = `https://wazo-digital.com/boutique/${store.slug}`;
    const caisse = `${APP}/sales`;

    console.log(`## ${store.name} (${store.slug})`);
    console.log(`   produits: ${products ?? 0} · ventes: ${sales ?? 0} · contact: ${contact || "—"}`);

    if (cmd === "audit") continue;

    const firstName = (owner?.full_name || store.name).split(" ")[0];
    const lines = [
      `Bonjour ${firstName} ! Suivi rapide *Wazo Digital* 🙏`,
      "",
    ];

    if ((sales ?? 0) === 0) {
      lines.push("Objectif cette semaine : *1 vente à la caisse*");
      lines.push(`→ Ouvrir la caisse : ${caisse}`);
      lines.push("→ Ajouter un article au panier → Finaliser → Partager le reçu WhatsApp");
      lines.push("");
    }

    if (noPhoto?.length) {
      lines.push(`📷 ${noPhoto.length}+ produit(s) sans photo — ajoutez une image depuis *Produits* pour booster le catalogue.`);
      lines.push("");
    }

    lines.push(`Votre vitrine : ${boutique}`);
    lines.push(`Guide : ${GUIDE}`);
    lines.push("Une difficulté ? Répondez avec une capture d'écran.");

    const text = lines.join("\n");
    console.log("\n" + text);
    console.log("\nWhatsApp:", waLink(contact, text));
    console.log("");
  }

  if (cmd === "audit") {
    const r = spawnSync("npm", ["run", "audit:cloud"], { cwd: WAZO, stdio: "inherit", shell: true });
    process.exit(r.status ?? 0);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
