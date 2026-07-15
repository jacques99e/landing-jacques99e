#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

const email = (process.argv[2] || "jacquesnoussougan93@gmail.com").trim();
const env = loadEnv();
const from = env.REPORT_EMAIL_FROM || "Wazo Digital <onboarding@wazo-digital.com>";

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${env.RESEND_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from,
    to: [email],
    subject: "Test Resend direct — Wazo Digital",
    text:
      "Ceci est un test Resend DIRECT (hors Supabase).\n\n" +
      "Si vous recevez ceci, Resend fonctionne.\n" +
      "Ensuite on vérifie le SMTP Auth Supabase.\n\n" +
      "Regardez aussi Spam.",
  }),
});
const body = await res.json().catch(() => ({}));
console.log("status", res.status);
console.log(JSON.stringify(body, null, 2));
if (!res.ok) process.exit(1);
console.log("\nOK — vérifiez Inbox/Spam:", email);
console.log("Puis Resend dashboard: https://resend.com/emails");
