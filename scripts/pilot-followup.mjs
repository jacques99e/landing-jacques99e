#!/usr/bin/env node
/**
 * Suivi réponses / silence pilotes (sans boîte mail).
 * Critère : activité boutique (produits/ventes) depuis la dernière relance.
 *
 * Usage:
 *   node scripts/pilot-followup.mjs
 *   node scripts/pilot-followup.mjs --relance-due   # envoie les relances dues
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import { createClient } from "@supabase/supabase-js";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPTS, "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");
const CONTACTS = path.join(SCRIPTS, "pilot-contacts.json");
const RELANCE_DAYS = 3;
const sendDue = process.argv.includes("--relance-due");

function loadEnv() {
  const out = {};
  for (const file of [path.join(WAZO, ".env.local"), path.join(ROOT, ".env.local")]) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
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

function addDays(isoDate, days) {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

const data = JSON.parse(fs.readFileSync(CONTACTS, "utf8"));
const env = loadEnv();
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const slugs = (data.pilots || [])
  .map((p) => p.storeSlug)
  .filter(Boolean)
  .map((s) => String(s).toLowerCase());

const { data: stores } = await admin
  .from("stores")
  .select("id, slug, name, whatsapp, phone, owner_id")
  .in("slug", slugs);

const bySlug = new Map((stores || []).map((s) => [String(s.slug).toLowerCase(), s]));

console.log(`=== Suivi pilotes ${today()} (relance si silence après ${RELANCE_DAYS}j) ===\n`);

const dueSlugs = [];

for (const p of data.pilots || []) {
  const slug = String(p.storeSlug || "").toLowerCase();
  const store = bySlug.get(slug);
  let products = p.score?.products ?? 0;
  let sales = p.score?.sales ?? 0;
  let email = p.email || "";

  if (store) {
    const [{ count: pc }, { count: sc }] = await Promise.all([
      admin.from("products").select("id", { count: "exact", head: true }).eq("store_id", store.id),
      admin.from("sales").select("id", { count: "exact", head: true }).eq("store_id", store.id),
    ]);
    products = pc ?? 0;
    sales = sc ?? 0;
    p.score = { products, sales };
    if (store.whatsapp) p.whatsapp = store.whatsapp;
    if (store.phone) p.phone = store.phone;
    try {
      const { data: auth } = await admin.auth.admin.getUserById(store.owner_id);
      if (auth?.user?.email) {
        email = auth.user.email;
        p.email = email;
      }
    } catch {
      /* ignore */
    }
  }

  const last = p.lastRelanceAt || null;
  const next = last ? addDays(last, RELANCE_DAYS) : today();
  p.nextRelanceAt = p.status === "completed" ? null : next;

  let signal = "ok";
  if (p.status === "completed") {
    signal = products > 0 && sales > 0 ? "parcours_ok" : "completed_faible";
  } else if (products > 0 || sales > 0) {
    signal = "activite_recente";
    p.status = products > 0 && sales > 0 ? "completed" : "active";
    if (p.status === "completed" && !p.completedAt) p.completedAt = today();
  } else if (!last) {
    signal = "jamais_relance";
  } else if (today() >= next) {
    signal = "silence_relancer";
    dueSlugs.push(slug);
  } else {
    signal = `attente_jusqu_au_${next}`;
  }

  console.log(
    `${p.id}  ${p.name}  [${p.status}]  ${slug || "—"}`
  );
  console.log(
    `       score ${products}p/${sales}v · email ${email || "—"} · WA ${p.whatsapp || p.phone || "—"}`
  );
  console.log(
    `       lastRelance ${last || "—"} · next ${p.nextRelanceAt || "—"} · ${signal}`
  );
  console.log("");
}

data.updatedAt = today();
data.lastFollowUpAt = today();
fs.writeFileSync(CONTACTS, `${JSON.stringify(data, null, 2)}\n`);
console.log(`[ok] pilot-contacts.json mis à jour`);

if (sendDue) {
  if (!dueSlugs.length) {
    console.log("\nAucune relance due aujourd'hui.");
  } else {
    console.log(`\n▶ Envoi relances dues: ${dueSlugs.join(", ")}`);
    const r = spawnSync(
      "node",
      ["scripts/pilot-send.mjs", "relance"],
      { cwd: ROOT, stdio: "inherit", shell: true }
    );
    process.exit(r.status ?? 1);
  }
} else if (dueSlugs.length) {
  console.log(`\nRelances dues: ${dueSlugs.join(", ")}`);
  console.log(`  node scripts/pilot-followup.mjs --relance-due`);
} else {
  console.log("\nAucune relance due. Revisitez dans 1–2 jours.");
}
