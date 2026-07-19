#!/usr/bin/env node
/**
 * Actions « suite » du jour (ops pilotes).
 * - Armel : nudge 1ère vente
 * - Balade : demande Status WhatsApp
 * - Omar / Eyram : bienvenue organique
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPTS, "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");
const APP = "https://app.wazo-digital.com";
const GUIDE = "https://wazo-digital.com/guide-pilote";
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

function waLink(phone, text) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 8) digits = `228${digits}`;
  if (digits.length === 9 && digits.startsWith("7")) digits = `221${digits}`;
  const base = digits ? `https://wa.me/${digits}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(text)}`;
}

function openUrl(url) {
  if (process.platform === "win32") {
    execSync(`start "" "${url.replace(/"/g, '\\"')}"`, { stdio: "ignore", shell: true });
  } else if (process.platform === "darwin") {
    execSync(`open "${url.replace(/"/g, '\\"')}"`, { stdio: "ignore" });
  } else {
    execSync(`xdg-open "${url.replace(/"/g, '\\"')}"`, { stdio: "ignore" });
  }
}

async function loadStore(admin, slug) {
  const { data: store } = await admin
    .from("stores")
    .select("id, slug, name, whatsapp, phone, owner_id")
    .eq("slug", slug)
    .maybeSingle();
  if (!store) return null;

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

  const [{ count: products }, { count: sales }] = await Promise.all([
    admin.from("products").select("id", { count: "exact", head: true }).eq("store_id", store.id),
    admin.from("sales").select("id", { count: "exact", head: true }).eq("store_id", store.id),
  ]);

  return {
    store,
    owner,
    email,
    phone: store.whatsapp || store.phone || owner?.phone || "",
    name: (owner?.full_name || store.name).trim().split(/\s+/)[0],
    products: products ?? 0,
    sales: sales ?? 0,
    boutique: `${APP}/boutique/${store.slug}`,
  };
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
  const contacts = JSON.parse(fs.readFileSync(CONTACTS, "utf8"));
  const today = new Date().toISOString().slice(0, 10);
  const results = [];

  // 1) Armel — nudge 1ère vente
  {
    const b = await loadStore(admin, "armel-shop");
    const pilot = contacts.pilots.find((p) => p.storeSlug === "armel-shop");
    const email = b?.email || pilot?.email || "";
    console.log("\n## ARMEL SHOP — nudge 1ère vente");
    if (!b) {
      console.log("   [fail] boutique introuvable");
      results.push({ id: "armel", ok: false });
    } else if (b.sales > 0) {
      console.log(`   [skip] déjà ${b.sales} vente(s)`);
      results.push({ id: "armel", ok: true, skipped: true });
    } else {
      const text = [
        `Bonjour ${b.name} !`,
        "",
        `Votre boutique *${b.store.name}* a déjà *${b.products} produit(s)* — super 👏`,
        "",
        "Prochaine étape (2 minutes) : *enregistrer votre 1ère vente* à la caisse.",
        `→ ${APP}/sales`,
        "",
        "Puis partagez le reçu WhatsApp à un client (même un test).",
        "",
        `Votre vitrine : ${b.boutique}`,
        `Guide : ${GUIDE}`,
        "",
        "Bloqué ? Répondez avec une capture d'écran.",
        "",
        "— Wazo Digital",
      ].join("\n");

      if (email) {
        const sent = await sendEmail(
          env,
          email,
          `ARMEL SHOP — faites votre 1ère vente Wazo`,
          text
        );
        console.log(
          sent.ok
            ? `   [ok] Email → ${email} (${sent.id || "—"})`
            : `   [fail] Email → ${email}: ${sent.error}`
        );
        results.push({ id: "armel", ok: sent.ok, email });
        if (sent.ok && pilot) {
          pilot.lastRelanceAt = today;
          const next = new Date(`${today}T12:00:00Z`);
          next.setUTCDate(next.getUTCDate() + 3);
          pilot.nextRelanceAt = next.toISOString().slice(0, 10);
          pilot.notes = `Nudge 1ère vente envoyé ${today}. ${pilot.notes || ""}`.trim();
          pilot.score = { products: b.products, sales: b.sales };
        }
      } else {
        console.log("   [fail] pas d'email");
        results.push({ id: "armel", ok: false });
      }
    }
  }

  // 2) Balade — Status WhatsApp
  {
    const b = await loadStore(admin, "balade-estivale");
    const pilot = contacts.pilots.find((p) => p.storeSlug === "balade-estivale");
    const phone = b?.phone || pilot?.whatsapp || pilot?.phone || "93924040";
    console.log("\n## Balade Estivale — Status WhatsApp");
    const text = [
      `Bonjour ${(b?.name || "Balade").split(" ")[0]} !`,
      "",
      "🎉 Bravo pour votre parcours pilote Wazo Digital.",
      "",
      "Petite demande : pouvez-vous partager votre vitrine en *WhatsApp Status* aujourd'hui ?",
      `→ ${b?.boutique || `${APP}/boutique/balade-estivale`}`,
      "",
      "Idée de texte Status :",
      `"Commandez chez Balade Estivale — catalogue WhatsApp 👇"`,
      "",
      "Et si possible, ajoutez une *photo* à vos produits 📷",
      `→ ${APP}/products`,
      "",
      "Merci 🙏 — Jacques / Wazo Digital",
    ].join("\n");

    const link = waLink(phone, text);
    try {
      openUrl(link);
      console.log(`   [ok] WhatsApp ouvert → ${phone} (cliquez Envoyer)`);
      results.push({ id: "balade", ok: true, phone });
      if (pilot) {
        pilot.notes = `Demande Status WhatsApp ouverte ${today}. ${pilot.notes || ""}`.trim();
      }
    } catch (e) {
      console.log(`   [fail] ${e.message}`);
      console.log(`   Lien: ${link}`);
      results.push({ id: "balade", ok: false });
    }
  }

  // 3) Organiques — bienvenue Omar + Eyram
  for (const slug of ["boutique-omar", "eyram-education"]) {
    const b = await loadStore(admin, slug);
    console.log(`\n## ${slug} — bienvenue organique`);
    if (!b) {
      console.log("   [skip] introuvable");
      results.push({ id: slug, ok: false });
      continue;
    }

    const text = [
      `Bonjour ${b.name} ! Bienvenue sur *Wazo Digital* 🎉`,
      "",
      `Merci d'avoir créé *${b.store.name}*.`,
      "",
      "Pour démarrer en 15 minutes :",
      `1️⃣ Ajoutez 3 produits → ${APP}/products/add`,
      `2️⃣ Faites 1 vente test → ${APP}/sales`,
      `3️⃣ Partagez votre vitrine → ${b.boutique}`,
      "",
      `📖 Guide : ${GUIDE}`,
      "",
      "Je reste dispo — bloqué ? Envoyez une capture ici.",
      "",
      "— Wazo Digital",
    ].join("\n");

    if (!b.email) {
      console.log("   [fail] pas d'email");
      results.push({ id: slug, ok: false });
      continue;
    }

    const sent = await sendEmail(
      env,
      b.email,
      `Bienvenue sur Wazo Digital — ${b.store.name}`,
      text
    );
    console.log(
      sent.ok
        ? `   [ok] Email → ${b.email} (${sent.id || "—"})`
        : `   [fail] Email → ${b.email}: ${sent.error}`
    );
    results.push({ id: slug, ok: sent.ok, email: b.email });

    if (sent.ok) {
      let pilot = contacts.pilots.find((p) => p.storeSlug === slug);
      if (!pilot) {
        pilot = {
          id: `organic-${slug}`,
          name: b.name,
          business: b.store.name,
          phone: b.phone || "",
          whatsapp: b.phone || "",
          email: b.email,
          city: "",
          status: b.products > 0 && b.sales > 0 ? "completed" : "active",
          invitedAt: today,
          storeSlug: slug,
          notes: `Bienvenue organique envoyée ${today}.`,
          score: { products: b.products, sales: b.sales },
        };
        contacts.pilots.push(pilot);
      } else {
        pilot.notes = `Bienvenue organique envoyée ${today}. ${pilot.notes || ""}`.trim();
        pilot.email = b.email || pilot.email;
        pilot.score = { products: b.products, sales: b.sales };
      }
    }
  }

  contacts.updatedAt = today;
  contacts.lastFollowUpAt = today;
  fs.writeFileSync(CONTACTS, `${JSON.stringify(contacts, null, 2)}\n`);

  console.log("\n=== Résumé ===");
  for (const r of results) {
    console.log(
      r.skipped
        ? `SKIP ${r.id}`
        : r.ok
          ? `OK ${r.id}${r.email ? ` → ${r.email}` : ""}${r.phone ? ` → WA ${r.phone}` : ""}`
          : `FAIL ${r.id}`
    );
  }
  console.log("\nProchaine fenêtre relance silencieux : 2026-07-21 (Espoir, Manthus, Mewe).");
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
