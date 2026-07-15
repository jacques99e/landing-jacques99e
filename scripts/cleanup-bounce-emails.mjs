#!/usr/bin/env node
/**
 * Nettoie les comptes Auth à fort risque de rebond.
 * Usage:
 *   node scripts/cleanup-bounce-emails.mjs --dry-run
 *   node scripts/cleanup-bounce-emails.mjs --apply
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");
const apply = process.argv.includes("--apply");

const BAD_EXACT = new Set([
  // typo évidente → bounce garanti
  "fn86598@gmail.com.com",
]);

const DISPOSABLE = ["fivejm.com", "mailinator.com", "yopmail.com", "guerrillamail", "tempmail"];

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

function isBad(email) {
  const e = String(email || "").toLowerCase().trim();
  if (!e) return { bad: false };
  if (BAD_EXACT.has(e)) return { bad: true, reason: "adresse invalide (typo)" };
  if (/\.com\.com$/.test(e) || /\.@/.test(e)) return { bad: true, reason: "format invalide" };
  if (DISPOSABLE.some((d) => e.includes(d))) return { bad: true, reason: "email jetable" };
  return { bad: false };
}

async function main() {
  const env = loadEnv();
  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const users = [];
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw new Error(error.message);
    users.push(...(data?.users || []));
    if (!data?.users?.length || data.users.length < 100) break;
    page += 1;
  }

  const targets = [];
  for (const u of users) {
    const check = isBad(u.email);
    if (check.bad) {
      targets.push({
        id: u.id,
        email: u.email,
        reason: check.reason,
        confirmed: Boolean(u.email_confirmed_at),
        created: (u.created_at || "").slice(0, 10),
      });
    }
  }

  console.log(`Mode: ${apply ? "APPLY (suppression)" : "DRY-RUN (aucune suppression)"}\n`);
  console.log(`Comptes à risque: ${targets.length}`);
  for (const t of targets) {
    console.log(`  - ${t.email} [${t.reason}] créé ${t.created} confirmé=${t.confirmed}`);
  }

  if (!apply) {
    console.log("\nPour supprimer ces comptes :");
    console.log("  node scripts/cleanup-bounce-emails.mjs --apply");
    return;
  }

  let deleted = 0;
  for (const t of targets) {
    // Ne pas supprimer AWODJE (pilote) sans flag — on skip les jetables confirmés pilotes
    if (String(t.email).toLowerCase().includes("fivejm.com")) {
      console.log(`  [skip] ${t.email} — pilote AWODJE (jetable mais actif). Demandez un vrai email.`);
      continue;
    }
    const { error } = await admin.auth.admin.deleteUser(t.id);
    if (error) {
      console.log(`  [fail] ${t.email}: ${error.message}`);
    } else {
      console.log(`  [ok] supprimé ${t.email}`);
      deleted += 1;
    }
  }
  console.log(`\nSupprimés: ${deleted}`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
