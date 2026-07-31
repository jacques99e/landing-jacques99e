#!/usr/bin/env node
/**
 * Aperçu abonnements / paiements PRO.
 * Usage: node scripts/check-billing-pro.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPTS, "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");

function loadEnvFile(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

function loadEnv() {
  // Landing peut écraser des clés partagées — on fusionne Landing puis App (App gagne).
  return {
    ...loadEnvFile(path.join(ROOT, ".env.local")),
    ...loadEnvFile(path.join(WAZO, ".env.local")),
  };
}

const env = loadEnv();
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: subs, error } = await admin
  .from("billing_subscriptions")
  .select("plan, status, store_id, updated_at");
if (error) {
  console.error("[fail]", error.message);
  process.exit(1);
}

const counts = {};
for (const s of subs || []) {
  const k = `${s.plan || "?"}/${s.status || "?"}`;
  counts[k] = (counts[k] || 0) + 1;
}
console.log("=== Billing ===");
console.log(counts);

const nonStarter = (subs || []).filter(
  (s) => String(s.plan || "").toLowerCase() !== "starter"
);
if (!nonStarter.length) {
  console.log("Aucun abonnement PRO détecté");
} else {
  for (const s of nonStarter) {
    const { data: st } = await admin
      .from("stores")
      .select("name, slug")
      .eq("id", s.store_id)
      .maybeSingle();
    console.log(`- ${st?.name || s.store_id} · ${s.plan} · ${s.status}`);
  }
}

const { count: payments } = await admin
  .from("billing_payments")
  .select("id", { count: "exact", head: true });
console.log("billing_payments:", payments ?? 0);

// IndexNow vit sur l'app — utiliser le CRON_SECRET app (pas celui Landing).
const appCron = loadEnvFile(path.join(WAZO, ".env.local")).CRON_SECRET?.trim();
if (appCron) {
  try {
    const res = await fetch("https://app.wazo-digital.com/api/cron/submit-indexing", {
      headers: { Authorization: `Bearer ${appCron}` },
    });
    const body = await res.json().catch(() => ({}));
    console.log("IndexNow:", res.status, body.success ? "ok" : body.error || "");
    if (res.ok && body.results) {
      for (const r of body.results) {
        console.log(`  · ${r.site} — ${r.urlCount ?? "?"} URL(s)`);
      }
    }
  } catch (e) {
    console.log("IndexNow:", e.message);
  }
} else {
  console.log("IndexNow: skip (CRON_SECRET manquant dans wazo-digital/.env.local)");
}
