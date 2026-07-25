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

if (env.CRON_SECRET) {
  try {
    const res = await fetch("https://app.wazo-digital.com/api/cron/submit-indexing", {
      headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
    });
    const body = await res.json().catch(() => ({}));
    console.log("IndexNow:", res.status, body.success ? "ok" : body.error || "");
  } catch (e) {
    console.log("IndexNow:", e.message);
  }
} else {
  console.log("IndexNow: skip (no CRON_SECRET)");
}
