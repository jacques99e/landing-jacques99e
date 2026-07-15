#!/usr/bin/env node
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
      const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
      if (v) out[t.slice(0, i).trim()] = v;
    }
  }
  return out;
}

const env = loadEnv();
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const slugs = [
  "manthus",
  "mewe-farms",
  "awodje",
  "espoir",
  "balade-estivale",
  "boutique-machallah",
];
const { data: stores } = await admin
  .from("stores")
  .select("id, slug, name, whatsapp, phone, owner_id")
  .in("slug", slugs);

for (const s of stores || []) {
  const { data: owner } = await admin
    .from("profiles")
    .select("phone, full_name")
    .eq("id", s.owner_id)
    .maybeSingle();
  let email = "";
  try {
    const { data: authUser } = await admin.auth.admin.getUserById(s.owner_id);
    email = authUser?.user?.email || "";
  } catch {}
  const [{ count: products }, { count: sales }] = await Promise.all([
    admin.from("products").select("id", { count: "exact", head: true }).eq("store_id", s.id),
    admin.from("sales").select("id", { count: "exact", head: true }).eq("store_id", s.id),
  ]);
  console.log(
    JSON.stringify({
      slug: s.slug,
      name: s.name,
      whatsapp: s.whatsapp || null,
      phone: s.phone || owner?.phone || null,
      email: email || null,
      products: products ?? 0,
      sales: sales ?? 0,
    })
  );
}
