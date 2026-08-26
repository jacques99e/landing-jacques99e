#!/usr/bin/env node
/** Pilotes avec paiement PRO pending — relance prioritaire */
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

const env = { ...loadEnv(path.join(ROOT, ".env.local")), ...loadEnv(path.join(WAZO, ".env.local")) };
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: pending } = await admin
  .from("billing_payments")
  .select("id,store_id,plan,status,amount,provider_tx_id,created_at")
  .eq("status", "pending")
  .in("plan", ["pro", "business"])
  .order("created_at", { ascending: false });

console.log("=== Paiements PRO/BUSINESS pending ===\n");
for (const p of pending || []) {
  const { data: st } = await admin.from("stores").select("name,slug").eq("id", p.store_id).maybeSingle();
  console.log(
    `- ${p.created_at?.slice(0, 10)} · ${st?.name || p.store_id} (${st?.slug || "?"}) · ${p.plan} · ${p.amount} FCFA · tx ${p.provider_tx_id || "-"}`
  );
}
console.log(`\nTotal pending: ${pending?.length ?? 0}`);
