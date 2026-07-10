#!/usr/bin/env node
/**
 * Envoie les messages pilotes (email Resend + lien WhatsApp si numéro connu).
 * Usage: node scripts/pilot-send.mjs outreach
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(SCRIPTS, "..");
const WAZO = path.join(ROOT, "..", "wazo-digital");
const GUIDE = "https://wazo-digital.com/guide-pilote";
const APP = "https://app.wazo-digital.com";

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

function waLink(phone, text) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 8) digits = `228${digits}`;
  if (digits.length === 9 && digits.startsWith("7")) digits = `221${digits}`;
  const base = digits ? `https://wa.me/${digits}` : "";
  return base ? `${base}?text=${encodeURIComponent(text)}` : "";
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
  if (!key) {
    return { ok: false, error: "RESEND_API_KEY manquant" };
  }

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

function openUrl(url) {
  if (process.platform === "win32") {
    execSync(`start "" "${url.replace(/"/g, '\\"')}"`, { stdio: "ignore", shell: true });
  } else if (process.platform === "darwin") {
    execSync(`open "${url.replace(/"/g, '\\"')}"`, { stdio: "ignore" });
  } else {
    execSync(`xdg-open "${url.replace(/"/g, '\\"')}"`, { stdio: "ignore" });
  }
}

function captureOutreach() {
  return execSync("node scripts/pilot-actions.mjs outreach", {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
}

function parseBlocks(output) {
  const blocks = [];
  const parts = output.split(/^## /m).slice(1);
  for (const part of parts) {
    const header = part.split("\n")[0] || "";
    const modeMatch = header.match(/\[(welcome|relance)\]/);
    const slugMatch = header.match(/\(([^)]+)\)/);
    const emailLine = part.match(/tel:\s*([^·]*)\s*·\s*email:\s*(\S+)/);
    const phoneRaw = emailLine?.[1]?.trim() || "";
    const emailRaw = emailLine?.[2]?.trim() || "";
    const messageStart = part.indexOf("Bonjour");
    const messageEnd = part.indexOf("\n\nWhatsApp");
    if (messageStart === -1 || messageEnd === -1) continue;
    const text = part.slice(messageStart, messageEnd).trim();
    const email = emailRaw && emailRaw !== "—" ? emailRaw : "";
    const phone = phoneRaw && phoneRaw !== "—" ? phoneRaw : "";
    blocks.push({
      header: header.trim(),
      mode: modeMatch?.[1] || "relance",
      slug: slugMatch?.[1]?.trim(),
      email,
      phone,
      text,
    });
  }
  return blocks;
}

async function main() {
  const output = captureOutreach();
  const blocks = parseBlocks(output);
  if (!blocks.length) {
    console.error("Aucun message à envoyer. Lancez d'abord pilot-actions outreach.");
    process.exit(1);
  }

  const env = loadEnv();
  console.log(`=== Envoi pilotes (${blocks.length}) ===\n`);

  for (const block of blocks) {
    console.log(`## ${block.header}`);
    const subject =
      block.mode === "welcome"
        ? `Bienvenue sur Wazo Digital — ${block.slug}`
        : `Suivi Wazo Digital — ${block.slug}`;

    let emailResult = null;
    if (block.email) {
      emailResult = await sendEmail(env, block.email, subject, block.text);
      if (emailResult.ok) {
        console.log(`   [ok] Email → ${block.email} (id: ${emailResult.id || "—"})`);
      } else {
        console.log(`   [fail] Email → ${block.email}: ${emailResult.error}`);
        const mailto = `mailto:${block.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText(block.text))}`;
        try {
          openUrl(mailto);
          console.log(`   [ok] Brouillon email ouvert → ${block.email} (cliquez Envoyer)`);
        } catch (e) {
          console.log(`   Lien mailto: ${mailto}`);
        }
      }
    } else {
      console.log("   [skip] Email — adresse inconnue");
    }

    if (block.phone) {
      const url = waLink(block.phone, block.text);
      if (url) {
        try {
          openUrl(url);
          console.log(`   [ok] WhatsApp ouvert → ${block.phone} (cliquez Envoyer)`);
        } catch (e) {
          console.log(`   [fail] WhatsApp: ${e.message}`);
          console.log(`   Lien: ${url}`);
        }
      }
    } else if (!emailResult?.ok && block.email) {
      const url = waLink("", block.text);
      console.log(`   [info] Pas de WhatsApp — partagez le mail ou demandez leur numéro`);
    }

    console.log("");
  }

  console.log("Terminé. Vérifiez WhatsApp (Balade) et les boîtes mail des pilotes.");
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
