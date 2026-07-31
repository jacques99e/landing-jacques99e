#!/usr/bin/env node
/** Compte utilisateurs / boutiques par module. */
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

function bump(map, key) {
  map[key] = (map[key] || 0) + 1;
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
  return mods.map(String);
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });

const [{ data: storeMods, error: e1 }, { data: profiles, error: e2 }, { data: stores, error: e3 }] =
  await Promise.all([
    admin.from("store_modules").select("module_id, enabled, store_id").eq("enabled", true),
    admin.from("profiles").select("id, active_modules"),
    admin.from("stores").select("id, name, slug, modules"),
  ]);

if (e1 || e2 || e3) {
  console.error(e1 || e2 || e3);
  process.exit(1);
}

const realStores = (stores || []).filter((s) => !String(s.slug).includes("test-roles"));
const realIds = new Set(realStores.map((s) => s.id));

const byStoreModules = {};
const storesPerModule = {};
for (const row of storeMods || []) {
  if (!realIds.has(row.store_id)) continue;
  bump(byStoreModules, row.module_id);
  if (!storesPerModule[row.module_id]) storesPerModule[row.module_id] = new Set();
  storesPerModule[row.module_id].add(row.store_id);
}

const byProfiles = {};
for (const p of profiles || []) {
  for (const m of asModules(p.active_modules)) bump(byProfiles, m);
}

const byStoresArray = {};
const multi = [];
for (const s of realStores) {
  const mods = asModules(s.modules);
  if (mods.length > 1) multi.push({ name: s.name, slug: s.slug, modules: mods });
  for (const m of mods) bump(byStoresArray, m);
}

// Si store_modules vide pour une boutique, fallback stores.modules / commerce
const covered = new Set((storeMods || []).filter((r) => realIds.has(r.store_id)).map((r) => r.store_id));
const effective = { ...Object.fromEntries(Object.keys(MODULE_LABELS).map((k) => [k, 0])) };
for (const [mod, set] of Object.entries(storesPerModule)) {
  effective[mod] = set.size;
}
for (const s of realStores) {
  if (covered.has(s.id)) continue;
  for (const m of asModules(s.modules)) {
    effective[m] = (effective[m] || 0) + 1;
  }
}

console.log(`Profiles: ${(profiles || []).length}`);
console.log(`Boutiques (hors test): ${realStores.length}`);
console.log(`Lignes store_modules enabled: ${(storeMods || []).filter((r) => realIds.has(r.store_id)).length}`);
console.log("");
console.log("=== Boutiques par module (source fiable) ===");
for (const id of Object.keys(MODULE_LABELS)) {
  const n = effective[id] || 0;
  const pct = realStores.length ? Math.round((n / realStores.length) * 100) : 0;
  console.log(`${MODULE_LABELS[id].padEnd(12)} ${String(n).padStart(3)}  (${pct}%)`);
}
console.log("");
console.log("=== Profiles.active_modules ===");
for (const id of Object.keys(MODULE_LABELS)) {
  console.log(`${MODULE_LABELS[id].padEnd(12)} ${byProfiles[id] || 0}`);
}
console.log("");
console.log(`Boutiques multi-modules: ${multi.length}`);
for (const m of multi.slice(0, 20)) {
  console.log(`  · ${m.name} (${m.slug}): ${m.modules.join(", ")}`);
}
if (multi.length > 20) console.log(`  … +${multi.length - 20}`);
