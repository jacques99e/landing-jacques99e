#!/usr/bin/env node
/**
 * Prépare l'environnement pour l'ouverture au grand public.
 * - Boutique test non listée publiquement
 * - Audit production complet
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const WAZO = path.join(ROOT, "..", "..", "wazo-digital");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (v) out[t.slice(0, i).trim()] = v;
  }
  return out;
}

function mergeEnv(...sources) {
  const out = {};
  for (const source of sources) {
    for (const [key, value] of Object.entries(source)) {
      if (value) out[key] = value;
    }
  }
  return out;
}

const env = mergeEnv(
  loadEnvFile(path.join(WAZO, ".env.local")),
  loadEnvFile(path.join(WAZO, ".env.vercel.production")),
  loadEnvFile(path.join(ROOT, ".env.local"))
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("[!!] NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant (wazo-digital/.env.local)");
  process.exit(1);
}

const { createClient } = await import("@supabase/supabase-js");
const admin = createClient(url, key, { auth: { persistSession: false } });

console.log("=== Préparation lancement public ===\n");

const { error } = await admin
  .from("stores")
  .update({ is_public: false })
  .eq("slug", "boutique-test-roles-wazo");
console.log(error ? `[!!] boutique test: ${error.message}` : "[ok] boutique test masquée (is_public=false)");

const r = spawnSync("node", ["scripts/production-readiness.mjs"], {
  cwd: WAZO,
  stdio: "inherit",
  shell: true,
});
process.exit(r.status ?? 1);
