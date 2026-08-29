#!/usr/bin/env node
/** Vérifie abonnement : prod endpoints + PayDunya + réconciliation */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPTS, "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");

function loadEnv() {
  const out = {};
  for (const p of [path.join(ROOT, ".env.local"), path.join(WAZO, ".env.local")]) {
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split("\n")) {
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
const APP = env.NEXT_PUBLIC_APP_URL || "https://app.wazo-digital.com";

console.log("=== 1) Endpoints prod ===\n");

const health = await fetch(`${APP}/api/health`);
console.log(`GET /api/health → ${health.status}`, (await health.json().catch(() => ({}))).status || "");

const billingNoAuth = await fetch(`${APP}/api/billing/subscription`);
console.log(`GET /api/billing/subscription (sans session) → ${billingNoAuth.status} (attendu 401)`);

const secret = env.PAYMENT_CALLBACK_SECRET?.trim();
if (secret) {
  const cb = await fetch(`${APP}/api/payments/momo/callback?secret=${encodeURIComponent(secret)}`);
  const cbJson = await cb.json().catch(() => ({}));
  console.log(
    `GET /api/payments/momo/callback (avec secret) → ${cb.status}`,
    cbJson.success ? "OK actif" : cbJson.error || JSON.stringify(cbJson)
  );
} else {
  console.log("GET callback → skip (PAYMENT_CALLBACK_SECRET absent en local)");
}

console.log("\n=== 2) PayDunya création facture test ===\n");
const mode = (env.PAYMENT_MODE || "simulate").toLowerCase();
const apiBase =
  mode === "live"
    ? "https://app.paydunya.com/api/v1"
    : "https://app.paydunya.com/sandbox-api/v1";

if (!env.PAYMENT_API_KEY || !env.PAYMENT_SECRET_KEY || !env.PAYMENT_TOKEN) {
  console.log("Clés PayDunya manquantes — skip create invoice");
} else {
  const res = await fetch(`${apiBase}/checkout-invoice/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "PAYDUNYA-MASTER-KEY": env.PAYMENT_API_KEY,
      "PAYDUNYA-PRIVATE-KEY": env.PAYMENT_SECRET_KEY,
      "PAYDUNYA-TOKEN": env.PAYMENT_TOKEN,
    },
    body: JSON.stringify({
      invoice: { total_amount: 100, description: "Wazo verify subscription" },
      store: { name: "Wazo Digital Verify" },
    }),
  });
  const data = await res.json().catch(() => ({}));
  const ok = data.response_code === "00";
  console.log(`POST checkout-invoice/create → HTTP ${res.status}, code ${data.response_code || "?"}`);
  console.log(ok ? "PayDunya API OK (facture test créée)" : `Erreur: ${data.response_text || JSON.stringify(data)}`);
  if (ok && data.token) {
    const confirm = await fetch(`${apiBase}/checkout-invoice/confirm/${encodeURIComponent(data.token)}`, {
      headers: {
        "PAYDUNYA-MASTER-KEY": env.PAYMENT_API_KEY,
        "PAYDUNYA-PRIVATE-KEY": env.PAYMENT_SECRET_KEY,
        "PAYDUNYA-TOKEN": env.PAYMENT_TOKEN,
      },
    });
    const c = await confirm.json().catch(() => ({}));
    console.log(`Confirm facture test → status PayDunya: ${c.status || "?"}`);
  }
}

console.log("\n=== 3) Base Supabase ===\n");
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: subs } = await admin.from("billing_subscriptions").select("plan,status");
const counts = {};
for (const s of subs || []) {
  const k = `${s.plan}/${s.status}`;
  counts[k] = (counts[k] || 0) + 1;
}
console.log("Abonnements:", counts);

const { data: payStats } = await admin.from("billing_payments").select("status,plan");
const pCounts = {};
for (const p of payStats || []) {
  const k = `${p.plan}/${p.status}`;
  pCounts[k] = (pCounts[k] || 0) + 1;
}
console.log("Paiements:", pCounts);

const proActive = (subs || []).filter((s) => s.plan === "pro" && s.status === "active");
console.log("\nPRO actifs:", proActive.length);

console.log("\n=== Verdict ===");
if (proActive.length > 0) {
  console.log("✅ Abonnement PRO fonctionne — au moins 1 actif.");
} else if (pCounts["pro/succeeded"] > 0) {
  console.log("⚠️ Paiements succeeded mais PRO pas activé — bug réconciliation.");
} else if ((pCounts["pro/pending"] || 0) > 0) {
  console.log("⚠️ Pipeline OK (factures créées) mais 0 paiement MoMo finalisé côté PayDunya.");
  console.log("   → Les commerçants abandonnent au checkout OU callback IPN à vérifier dans PayDunya.");
} else {
  console.log("❌ Aucune tentative PRO enregistrée.");
}
