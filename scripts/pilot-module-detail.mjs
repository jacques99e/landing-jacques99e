#!/usr/bin/env node
/** Détail nominatif utilisateurs ↔ modules. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPTS, "..");
const MODULE_LABELS = {
  commerce: "Commerce",
  agriculture: "Agriculture",
  health: "Santé",
  logistics: "Logistique",
  education: "Éducation",
  blockchain: "Blockchain",
};
const ORDER = Object.keys(MODULE_LABELS);

function loadEnv() {
  const out = {};
  for (const file of [
    path.join(ROOT, ".env.local"),
    path.join(ROOT, "..", "wazo-digital", ".env.local"),
  ]) {
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

function asModules(raw) {
  let mods = raw;
  if (typeof mods === "string") {
    try {
      mods = JSON.parse(mods);
    } catch {
      mods = ["commerce"];
    }
  }
  if (!Array.isArray(mods) || mods.length === 0) return ["commerce"];
  return [...new Set(mods.map(String))];
}

const env = loadEnv();
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const [
  { data: profiles },
  { data: stores },
  { data: storeMods },
  { data: products },
  { data: sales },
] = await Promise.all([
  admin.from("profiles").select("id, full_name, phone, active_modules"),
  admin.from("stores").select("id, name, slug, modules, owner_id, created_at, whatsapp, phone"),
  admin.from("store_modules").select("module_id, enabled, store_id"),
  admin.from("products").select("store_id"),
  admin.from("sales").select("store_id"),
]);

const realStores = (stores || []).filter((s) => !String(s.slug || "").includes("test-roles"));
const profileById = new Map((profiles || []).map((p) => [p.id, p]));

const prodCount = {};
const saleCount = {};
for (const p of products || []) prodCount[p.store_id] = (prodCount[p.store_id] || 0) + 1;
for (const s of sales || []) saleCount[s.store_id] = (saleCount[s.store_id] || 0) + 1;

const enabledByStore = new Map();
for (const row of storeMods || []) {
  if (!row.enabled) continue;
  if (!enabledByStore.has(row.store_id)) enabledByStore.set(row.store_id, []);
  enabledByStore.get(row.store_id).push(row.module_id);
}

function effectiveStoreModules(store) {
  const fromTable = enabledByStore.get(store.id);
  if (fromTable?.length) return [...new Set(fromTable)];
  return asModules(store.modules);
}

const rows = realStores.map((s) => {
  const owner = profileById.get(s.owner_id);
  const intent = asModules(owner?.active_modules);
  const live = effectiveStoreModules(s);
  const missing = intent.filter((m) => !live.includes(m));
  const extra = live.filter((m) => !intent.includes(m));
  return {
    name: s.name?.trim() || "—",
    slug: s.slug,
    owner: owner?.full_name || "—",
    emailPhone: owner?.phone || s.whatsapp || s.phone || "—",
    intent,
    live,
    missing,
    extra,
    products: prodCount[s.id] || 0,
    sales: saleCount[s.id] || 0,
    created: String(s.created_at || "").slice(0, 10),
    source: enabledByStore.has(s.id) ? "store_modules" : "stores.modules/défaut",
  };
});

// Profiles without store
const owners = new Set(realStores.map((s) => s.owner_id).filter(Boolean));
const orphanProfiles = (profiles || []).filter((p) => !owners.has(p.id));

console.log("====================================================");
console.log(" RÉPARTITION MODULES — détail 2026-07-27");
console.log("====================================================");
console.log(`Profiles: ${(profiles || []).length} · Boutiques hors test: ${rows.length}`);
console.log(`Profiles sans boutique: ${orphanProfiles.length}`);
console.log("");

console.log("--- Synthèse boutiques (modules effectivement actifs) ---");
for (const id of ORDER) {
  const list = rows.filter((r) => r.live.includes(id));
  const pct = Math.round((list.length / rows.length) * 100);
  console.log(`${MODULE_LABELS[id]}: ${list.length}/${rows.length} (${pct}%)`);
}

console.log("");
console.log("--- Synthèse intentions profil (active_modules) ---");
for (const id of ORDER) {
  const n = (profiles || []).filter((p) => asModules(p.active_modules).includes(id)).length;
  console.log(`${MODULE_LABELS[id]}: ${n}/${(profiles || []).length}`);
}

console.log("");
console.log("--- Écart inscription → boutique ---");
const gaps = rows.filter((r) => r.missing.length);
console.log(`Boutiques où des modules cochés ne sont PAS actifs: ${gaps.length}`);
for (const g of gaps) {
  console.log(
    `  · ${g.name} (${g.slug}) — voulu: [${g.intent.join(", ")}] · actif: [${g.live.join(", ")}] · manquant: [${g.missing.join(", ")}]`
  );
}

console.log("");
console.log("--- Par module : qui l’a (boutique) ---");
for (const id of ORDER) {
  const list = rows.filter((r) => r.live.includes(id));
  console.log(`\n## ${MODULE_LABELS[id]} (${list.length})`);
  if (!list.length) {
    console.log("  (aucun)");
    continue;
  }
  for (const r of list.sort((a, b) => b.sales - a.sales || b.products - a.products)) {
    console.log(
      `  · ${r.name} — ${r.products}p/${r.sales}v — owner:${r.owner} — source:${r.source} — créé ${r.created}`
    );
  }
}

console.log("");
console.log("--- Par module : qui l’a coché (profil) hors commerce-only ---");
const interesting = (profiles || []).filter((p) => {
  const mods = asModules(p.active_modules);
  return mods.some((m) => m !== "commerce") || mods.length > 1;
});
console.log(`Profiles multi/non-commerce: ${interesting.length}`);
for (const p of interesting) {
  const mods = asModules(p.active_modules);
  const store = rows.find((r) => {
    const owner = profileById.get(
      realStores.find((s) => s.slug === r.slug)?.owner_id
    );
    return owner?.id === p.id;
  });
  // find store by owner
  const st = rows.find((r) => realStores.find((s) => s.slug === r.slug && s.owner_id === p.id));
  console.log(
    `  · ${(p.full_name || p.id).slice(0, 36)} — [${mods.join(", ")}] — boutique: ${st ? st.name + " [" + st.live.join(", ") + "]" : "AUCUNE"}`
  );
}

console.log("");
console.log("--- Profiles sans boutique (modules) ---");
for (const p of orphanProfiles) {
  const mods = asModules(p.active_modules);
  console.log(`  · ${(p.full_name || p.id).slice(0, 40)} — [${mods.join(", ")}]`);
}

console.log("");
console.log("--- Funnel activité vs module principal ---");
const primary = (mods) => mods[0] || "commerce";
const buckets = {};
for (const r of rows) {
  const key = primary(r.live);
  if (!buckets[key]) buckets[key] = { n: 0, withProd: 0, withSale: 0, products: 0, sales: 0 };
  buckets[key].n += 1;
  if (r.products > 0) buckets[key].withProd += 1;
  if (r.sales > 0) buckets[key].withSale += 1;
  buckets[key].products += r.products;
  buckets[key].sales += r.sales;
}
for (const id of ORDER) {
  const b = buckets[id];
  if (!b) continue;
  console.log(
    `${MODULE_LABELS[id]}: ${b.n} boutiques · ${b.withProd} avec produit · ${b.withSale} avec vente · tot ${b.products}p/${b.sales}v`
  );
}
