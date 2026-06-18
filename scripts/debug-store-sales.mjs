#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const slug = process.argv[2] || "balade-estivale";
const ROOT = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const paths = [
    path.join(ROOT, "..", ".env.local"),
    path.join(ROOT, "..", "..", "wazo-digital", ".env.local"),
  ];
  const out = {};
  for (const envPath of paths) {
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
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

const env = loadEnv();
const { createClient } = await import("@supabase/supabase-js");
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: store, error: storeErr } = await admin
  .from("stores")
  .select("id, name, slug, owner_id, whatsapp, phone")
  .eq("slug", slug)
  .single();

if (storeErr || !store) {
  console.error("Store not found:", storeErr?.message);
  process.exit(1);
}

console.log("=== Store ===");
console.log(store);

const [{ count: products }, { count: sales }, { data: recentSales }, { data: saleItems }] =
  await Promise.all([
    admin.from("products").select("id", { count: "exact", head: true }).eq("store_id", store.id),
    admin.from("sales").select("id", { count: "exact", head: true }).eq("store_id", store.id),
    admin
      .from("sales")
      .select("id, total, created_at, payment_method, local_id, synced_at, status")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false })
      .limit(20),
    admin.from("sale_items").select("id, sale_id, product_id, quantity, unit_price").limit(20),
  ]);

console.log("\n=== Counts ===");
console.log({ products, sales });

console.log("\n=== Recent sales ===");
console.log(recentSales?.length ? recentSales : "(aucune)");

console.log("\n=== Sale items (sample) ===");
console.log(saleItems?.length ? saleItems : "(aucun)");

// Check audit_logs for sales attempts
const { data: audits } = await admin
  .from("audit_logs")
  .select("action, created_at, metadata")
  .eq("store_id", store.id)
  .ilike("action", "%sale%")
  .order("created_at", { ascending: false })
  .limit(10);

console.log("\n=== Audit logs (sale*) ===");
console.log(audits?.length ? audits : "(aucun)");
