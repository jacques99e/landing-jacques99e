#!/usr/bin/env node
/**
 * Liste les boutiques cloud absentes du tracker.
 * Usage: node scripts/pilot-find-missing.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPTS, "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");
const CONTACTS = path.join(SCRIPTS, "pilot-contacts.json");

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

const env = loadEnv();
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const data = JSON.parse(fs.readFileSync(CONTACTS, "utf8"));
const known = new Set((data.pilots || []).map((p) => String(p.storeSlug || "").toLowerCase()));

const { data: stores } = await admin
  .from("stores")
  .select("slug, name, created_at")
  .neq("slug", "boutique-test-roles-wazo")
  .order("created_at", { ascending: false });

const missing = (stores || []).filter((s) => !known.has(String(s.slug).toLowerCase()));
console.log(`stores ${(stores || []).length} · tracker ${known.size} · missing ${missing.length}`);
for (const s of missing) {
  console.log(`MISSING ${s.slug} · ${s.name} · ${String(s.created_at || "").slice(0, 10)}`);
}
if (missing.length) {
  console.log("\nSlugs à ajouter dans NEW_SLUGS de pilot-welcome-new.mjs :");
  console.log(missing.map((s) => s.slug).join(", "));
}
