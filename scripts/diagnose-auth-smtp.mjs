#!/usr/bin/env node
/**
 * Diagnostique Resend + tente un envoi Auth recovery pour afficher l'erreur exacte.
 * Usage: node scripts/diagnose-auth-smtp.mjs votre@email.com
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

async function main() {
  const email = (process.argv[2] || "jacquesnoussougan93@gmail.com").trim();
  const env = loadEnv();
  const key = env.RESEND_API_KEY?.trim();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("=== Diagnostic Auth SMTP / Resend ===\n");

  // 1) Domaines Resend
  if (key) {
    const domRes = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${key}` },
    });
    const domBody = await domRes.json().catch(() => ({}));
    console.log("1) Domaines Resend:", domRes.status);
    if (domRes.ok) {
      for (const d of domBody.data || []) {
        console.log(`   - ${d.name} status=${d.status} region=${d.region || "?"}`);
      }
    } else {
      console.log("   ", domBody.message || JSON.stringify(domBody));
      console.log("   → Si 'restricted', créez une clé Full access sur https://resend.com/api-keys");
    }
  }

  // 2) Envoi Resend direct (contrôle clé + from)
  if (key) {
    const from = env.REPORT_EMAIL_FROM || "Wazo Digital <onboarding@wazo-digital.com>";
    const sendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Diag Resend OK",
        text: "Si reçu: clé Resend + domaine OK. Le problème est alors la config SMTP Supabase.",
      }),
    });
    const sendBody = await sendRes.json().catch(() => ({}));
    console.log("\n2) Envoi Resend direct:", sendRes.status, sendBody.id || sendBody.message);
  }

  // 3) Recovery Supabase (erreur exacte)
  if (url && anon) {
    const supabase = createClient(url, anon, { auth: { persistSession: false } });
    console.log("\n3) resetPasswordForEmail…");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://wazo-digital.com/auth/callback",
    });
    if (error) {
      console.log("   [fail]", error.message);
      console.log("   status:", error.status);
      console.log("   code:", error.code || "—");
    } else {
      console.log("   [ok] Pas d'erreur API (l'email peut quand même échouer côté SMTP)");
    }
  }

  // 4) Generate link admin (ne passe pas par SMTP client, mais valide user)
  if (url && service) {
    const admin = createClient(url, service, { auth: { persistSession: false } });
    console.log("\n4) generateLink recovery (admin)…");
    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: "https://wazo-digital.com/auth/callback" },
    });
    if (error) {
      console.log("   [fail]", error.message);
    } else {
      console.log("   [ok] Lien généré (user existe)");
      console.log("   action_link:", data?.properties?.action_link ? "présent" : "absent");
    }
  }

  console.log(`
=== Checklist SMTP Supabase (à corriger si recovery échoue) ===
Dashboard: https://supabase.com/dashboard/project/gfqmmdihubcpvouidpkc/auth/smtp

Valeurs EXACTES:
  Enable Custom SMTP : ON
  Sender email       : onboarding@wazo-digital.com
  Sender name        : Wazo Digital
  Host               : smtp.resend.com
  Port               : 465   (si échec, essayer 587)
  Username           : resend
  Password           : clé API Resend FULL ACCESS (re_...)
  Minimum interval   : laisser défaut

Puis Save → retester forgot-password.

Logs Auth: https://supabase.com/dashboard/project/gfqmmdihubcpvouidpkc/logs/explorer
Filtrer: auth / error / smtp
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
