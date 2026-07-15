#!/usr/bin/env node
/**
 * Audit emails Auth Supabase (rebonds) + guide SMTP Resend.
 * Usage: node scripts/audit-auth-emails.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");

const DISPOSABLE_HINTS = [
  "fivejm.com",
  "mailinator.com",
  "guerrillamail",
  "tempmail",
  "10minutemail",
  "yopmail",
  "trashmail",
  "fakeinbox",
  "sharklasers",
  "throwaway",
];

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

function isSuspicious(email) {
  const e = String(email || "").toLowerCase();
  if (!e.includes("@")) return true;
  return DISPOSABLE_HINTS.some((d) => e.includes(d));
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Clés Supabase manquantes (.env.local)");
    process.exit(1);
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const users = [];
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw new Error(error.message);
    users.push(...(data?.users || []));
    if (!data?.users?.length || data.users.length < 100) break;
    page += 1;
    if (page > 20) break;
  }

  console.log(`=== Audit emails Auth (${users.length} comptes) ===\n`);
  const suspicious = [];
  const unconfirmed = [];
  for (const u of users) {
    const email = u.email || "";
    const row = {
      id: u.id.slice(0, 8),
      email,
      confirmed: Boolean(u.email_confirmed_at),
      created: (u.created_at || "").slice(0, 10),
      lastSignIn: (u.last_sign_in_at || "").slice(0, 10) || "—",
    };
    if (isSuspicious(email)) suspicious.push(row);
    if (!u.email_confirmed_at) unconfirmed.push(row);
  }

  console.log(`Suspects / jetables : ${suspicious.length}`);
  for (const r of suspicious) {
    console.log(`  ! ${r.email}  créé ${r.created}  confirmé=${r.confirmed}`);
  }
  console.log(`\nNon confirmés : ${unconfirmed.length}`);
  for (const r of unconfirmed.slice(0, 30)) {
    console.log(`  · ${r.email || "(sans email)"}  créé ${r.created}`);
  }
  if (unconfirmed.length > 30) console.log(`  … +${unconfirmed.length - 30}`);

  console.log(`
=== Action immédiate (SMTP Resend) ===
1. Ouvrir : https://supabase.com/dashboard/project/gfqmmdihubcpvouidpkc/auth/smtp
2. Enable Custom SMTP
3. Remplir :
   - Sender email : onboarding@wazo-digital.com
   - Sender name  : Wazo Digital
   - Host         : smtp.resend.com
   - Port         : 465
   - Username     : resend
   - Password     : votre RESEND_API_KEY (re_...)
4. Save
5. Tester : inscription avec VOTRE vrai email (pas un jetable)

=== Réduire les rebonds ===
- Ne plus tester avec des emails faux / jetables (ex. fivejm.com)
- Supprimer ou ignorer les comptes suspects ci-dessus
- Activer CAPTCHA sur Auth (anti bots inscription)
- Garder Resend pour les emails Auth (pas le SMTP gratuit Supabase)
`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
