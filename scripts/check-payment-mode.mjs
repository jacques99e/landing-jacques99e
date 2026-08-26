#!/usr/bin/env node
/** Vérifie mode paiement + derniers billing_payments */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPTS, "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");

function loadEnv(p) {
  const out = {};
  if (!fs.existsSync(p)) return out;
    for (const line of fs.readFileSync(p, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      out[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = {
  ...loadEnv(path.join(ROOT, ".env.local")),
  ...loadEnv(path.join(WAZO, ".env.local")),
};
const mode = env.PAYMENT_MODE || "(unset → simulate)";
const hasPaydunya = Boolean(
  env.PAYMENT_API_KEY && env.PAYMENT_SECRET_KEY && env.PAYMENT_TOKEN
);
console.log("=== Paiement ===");
console.log("PAYMENT_MODE:", mode);
console.log("PayDunya keys:", hasPaydunya ? "OK (local)" : "MANQUANTES (local)");
console.log("Callback secret:", env.PAYMENT_CALLBACK_SECRET ? "yes" : "NO");

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: payments } = await admin
  .from("billing_payments")
  .select("plan,status,amount,method,provider,created_at")
  .order("created_at", { ascending: false })
  .limit(10);

console.log("\n=== Derniers paiements ===");
for (const p of payments || []) {
  console.log(`- ${p.created_at?.slice(0, 10)} · ${p.plan} · ${p.status} · ${p.amount} · ${p.provider}`);
}

const { data: proActive } = await admin
  .from("billing_subscriptions")
  .select("plan,status,store_id,updated_at")
  .eq("plan", "pro")
  .eq("status", "active");
console.log("\nPRO actifs:", proActive?.length ?? 0);
if (proActive?.length) console.log(proActive);
