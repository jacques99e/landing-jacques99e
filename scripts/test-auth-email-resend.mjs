#!/usr/bin/env node
/**
 * Test email Auth Supabase → SMTP Resend
 * Usage:
 *   node scripts/test-auth-email-resend.mjs votre@email.com
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
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

async function listResendRecent(apiKey) {
  const res = await fetch("https://api.resend.com/emails?limit=10", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, error: body.message || res.statusText, emails: [] };
  }
  return { ok: true, emails: body.data || [] };
}

async function main() {
  const email = (process.argv[2] || "").trim().toLowerCase();
  if (!email || !email.includes("@") || email.includes("fivejm") || email.endsWith(".com.com")) {
    console.error("Usage: node scripts/test-auth-email-resend.mjs votre.vrai@email.com");
    process.exit(1);
  }

  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const resendKey = env.RESEND_API_KEY?.trim();
  if (!url || !anon) {
    console.error("Clés Supabase manquantes");
    process.exit(1);
  }

  console.log("=== Test Auth email → Resend ===\n");
  console.log(`Destinataire: ${email}`);
  console.log(`Supabase: ${url}`);

  // Avant
  let beforeIds = new Set();
  if (resendKey) {
    const before = await listResendRecent(resendKey);
    if (before.ok) {
      beforeIds = new Set(before.emails.map((e) => e.id));
      console.log(`Resend: ${before.emails.length} derniers emails visibles`);
    } else {
      console.log(`Resend liste: [warn] ${before.error}`);
    }
  } else {
    console.log("Resend: pas de RESEND_API_KEY locale (on teste quand même Supabase)");
  }

  const supabase = createClient(url, anon, { auth: { persistSession: false } });
  const redirectTo = "https://wazo-digital.com/auth/callback";

  console.log("\n1) Envoi resetPasswordForEmail…");
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) {
    console.log(`   [fail] Supabase: ${error.message}`);
    console.log("\nCauses fréquentes:");
    console.log("- SMTP Resend mal enregistré (mot de passe = clé re_…, user = resend)");
    console.log("- Sender email pas sur domaine vérifié (ex: onboarding@wazo-digital.com)");
    console.log("- Rate limit Auth");
    process.exit(1);
  }
  console.log("   [ok] Supabase a accepté la demande (pas d'erreur API)");
  console.log("   data:", JSON.stringify(data || {}));

  console.log("\n2) Attente 8s puis contrôle Resend…");
  await new Promise((r) => setTimeout(r, 8000));

  if (!resendKey) {
    console.log("   Ouvrez https://resend.com/emails et cherchez un mail vers", email);
    return;
  }

  const after = await listResendRecent(resendKey);
  if (!after.ok) {
    console.log(`   [fail] Resend API: ${after.error}`);
    return;
  }

  const newest = after.emails.filter((e) => !beforeIds.has(e.id));
  const toTarget = after.emails.filter(
    (e) =>
      String(e.to || "").toLowerCase().includes(email) ||
      (Array.isArray(e.to) && e.to.some((t) => String(t).toLowerCase() === email))
  );

  if (newest.length) {
    console.log(`   [ok] ${newest.length} nouvel(aux) email(s) Resend:`);
    for (const e of newest.slice(0, 5)) {
      console.log(`   - ${e.id} | ${e.to} | ${e.subject || "—"} | ${e.last_event || e.created_at}`);
    }
  } else if (toTarget.length) {
    console.log("   [info] Pas de nouvel id, mais des mails vers cette adresse existent:");
    for (const e of toTarget.slice(0, 3)) {
      console.log(`   - ${e.subject || "—"} | ${e.last_event || e.created_at}`);
    }
  } else {
    console.log("   [fail] Aucun email Resend détecté vers cette adresse.");
    console.log("\nVérifiez dans Supabase → Authentication → SMTP:");
    console.log("  Host: smtp.resend.com");
    console.log("  Port: 465");
    console.log("  User: resend");
    console.log("  Pass: RESEND_API_KEY (re_...)");
    console.log("  Sender: onboarding@wazo-digital.com (domaine vérifié)");
    console.log("\nPuis regardez aussi: Supabase → Logs → Auth");
  }

  console.log("\nBoîte mail: vérifiez Inbox + Spam pour", email);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
