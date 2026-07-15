#!/usr/bin/env node
/**
 * Actions ciblées :
 * - Demander WhatsApp à Manthus + Mewe farms
 * - Féliciter AWODJE + demander une photo produit
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPTS, "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");
const APP = "https://app.wazo-digital.com";
const CONTACTS = path.join(SCRIPTS, "pilot-contacts.json");

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

function plainText(text) {
  return text.replace(/\*/g, "");
}

function toHtml(text) {
  return plainText(text)
    .split("\n")
    .map((line) => {
      const escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      if (!escaped.trim()) return "<br>";
      const linked = escaped.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1">$1</a>'
      );
      return `<p style="margin:0 0 8px;font-family:sans-serif;font-size:15px;line-height:1.5">${linked}</p>`;
    })
    .join("\n");
}

async function sendEmail(env, to, subject, text) {
  const key = env.RESEND_API_KEY?.trim();
  const from =
    env.REPORT_EMAIL_FROM?.trim() || "Wazo Digital <onboarding@wazo-digital.com>";
  if (!key) return { ok: false, error: "RESEND_API_KEY manquant" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text: plainText(text),
      html: `<div style="max-width:560px;padding:16px">${toHtml(text)}</div>`,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, error: body.message || body.error || res.statusText };
  }
  return { ok: true, id: body.id };
}

function askWhatsAppMessage(name, storeName) {
  return [
    `Bonjour ${name} !`,
    "",
    `Pour mieux vous accompagner sur *Wazo Digital* (boutique *${storeName}*), pouvez-vous me répondre avec votre *numéro WhatsApp* ?`,
    "",
    "Ainsi je pourrai vous envoyer les rappels et le guide directement sur WhatsApp.",
    "",
    `En attendant : ajoutez 1 produit ici → ${APP}/products/add`,
    "",
    "Merci 🙏 — Wazo Digital",
  ].join("\n");
}

function congratulateAwodjeMessage(name, boutique) {
  return [
    `Bonjour ${name} !`,
    "",
    "🎉 *Bravo* — vous avez terminé le parcours pilote Wazo Digital :",
    "✅ 1 produit ajouté",
    "✅ 1 vente enregistrée",
    "",
    "Prochaine étape simple :",
    "📷 Ajoutez une *belle photo* à votre produit (ça augmente les commandes WhatsApp).",
    `→ ${APP}/products`,
    "",
    `Votre vitrine : ${boutique}`,
    "",
    "Merci d'être pilote 🙏 — n'hésitez pas à partager une capture de votre boutique !",
    "",
    "— Équipe Wazo Digital",
  ].join("\n");
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Clés Supabase manquantes");
    process.exit(1);
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const targets = [
    { slug: "manthus", kind: "whatsapp" },
    { slug: "mewe-farms", kind: "whatsapp" },
    { slug: "awodje", kind: "congrats" },
  ];

  const { data: stores, error } = await admin
    .from("stores")
    .select("id, slug, name, whatsapp, phone, owner_id")
    .in(
      "slug",
      targets.map((t) => t.slug)
    );

  if (error) throw new Error(error.message);

  const contacts = JSON.parse(fs.readFileSync(CONTACTS, "utf8"));
  const today = new Date().toISOString().slice(0, 10);
  const results = [];

  for (const target of targets) {
    const store = (stores || []).find((s) => s.slug === target.slug);
    if (!store) {
      console.log(`[skip] Boutique introuvable: ${target.slug}`);
      continue;
    }

    const { data: owner } = await admin
      .from("profiles")
      .select("phone, full_name")
      .eq("id", store.owner_id)
      .maybeSingle();

    let email = "";
    try {
      const { data: authUser } = await admin.auth.admin.getUserById(store.owner_id);
      email = authUser?.user?.email || "";
    } catch {
      /* ignore */
    }

    // Fallback email from pilot-contacts
    if (!email) {
      const pilot = contacts.pilots.find((p) => p.storeSlug === store.slug);
      email = pilot?.email || "";
    }

    const phone = store.whatsapp || store.phone || owner?.phone || "";
    const name = (owner?.full_name || store.name).trim().split(/\s+/)[0];
    const boutique = `${APP}/boutique/${store.slug}`;

    console.log(`\n## ${store.name} (${store.slug})`);
    console.log(`   email: ${email || "—"} · whatsapp/tel: ${phone || "—"}`);

    if (phone && target.kind === "whatsapp") {
      console.log(`   [info] WhatsApp déjà connu: ${phone} — on demande confirmation / mise à jour`);
    }

    let text;
    let subject;
    if (target.kind === "whatsapp") {
      subject = `Votre WhatsApp pour Wazo Digital — ${store.name}`;
      text = askWhatsAppMessage(name, store.name);
    } else {
      subject = `Bravo ${store.name} — prochaine étape photo produit`;
      text = congratulateAwodjeMessage(name, boutique);
    }

    if (!email) {
      console.log("   [fail] Pas d'email — impossible d'envoyer automatiquement");
      results.push({ slug: store.slug, ok: false, reason: "no-email" });
      continue;
    }

    const sent = await sendEmail(env, email, subject, text);
    if (sent.ok) {
      console.log(`   [ok] Email → ${email} (id: ${sent.id || "—"})`);
      results.push({ slug: store.slug, ok: true, email });

      const pilot = contacts.pilots.find((p) => p.storeSlug === store.slug);
      if (pilot) {
        if (target.kind === "whatsapp") {
          pilot.notes = `Demande WhatsApp envoyée ${today} (email). ${pilot.notes || ""}`.trim();
        } else {
          pilot.notes = `Félicitations + demande photo envoyées ${today}. ${pilot.notes || ""}`.trim();
        }
      }
    } else {
      console.log(`   [fail] Email → ${email}: ${sent.error}`);
      results.push({ slug: store.slug, ok: false, reason: sent.error });
    }
  }

  contacts.updatedAt = today;
  contacts.lastSyncedAt = today;
  fs.writeFileSync(CONTACTS, `${JSON.stringify(contacts, null, 2)}\n`);

  console.log("\n=== Résumé ===");
  for (const r of results) {
    console.log(r.ok ? `OK ${r.slug} → ${r.email}` : `FAIL ${r.slug} (${r.reason})`);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
