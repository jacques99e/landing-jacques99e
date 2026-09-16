/**
 * Partenaire 360dialog — même numéro, WhatsApp Business + API (coexistence).
 * Usage :
 *   npm run wa:partenaire
 *   npm run wa:webhook   (après WHATSAPP_360DIALOG_API_KEY dans .env.local)
 */
import { createHash, randomBytes } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENV_PATH = path.join(ROOT, ".env.local");
const SIGNUP = "https://app.360dialog.io/signup/index.html";
const HUB = "https://hub.360dialog.com/";
const WEBHOOK = "https://wazo-digital.com/api/whatsapp/webhook";
const D360 = "https://waba-v2.360dialog.io";

function loadEnvFile(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (v) out[t.slice(0, i).trim()] = v;
  }
  return out;
}

function appendEnv(key, value) {
  const current = loadEnvFile(ENV_PATH);
  if (current[key]) return current[key];
  const line = `\n${key}=${value}\n`;
  fs.appendFileSync(ENV_PATH, line);
  return value;
}

const env = { ...loadEnvFile(ENV_PATH), ...process.env };
const verifyToken = env.WHATSAPP_VERIFY_TOKEN || appendEnv("WHATSAPP_VERIFY_TOKEN", randomBytes(24).toString("hex"));
const apiKey = env.WHATSAPP_360DIALOG_API_KEY || "";

if (process.argv.includes("--webhook")) {
  if (!apiKey) {
    console.error("Ajoute WHATSAPP_360DIALOG_API_KEY dans .env.local puis relance npm run wa:webhook");
    process.exit(1);
  }
  const res = await fetch(`${D360}/v1/configs/webhook`, {
    method: "POST",
    headers: {
      "D360-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: WEBHOOK,
      headers: { "X-Wazo-Webhook-Secret": verifyToken },
    }),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error("Webhook 360dialog refusé:", res.status, body.slice(0, 400));
    process.exit(1);
  }
  console.log("Webhook pointé vers", WEBHOOK);
  console.log("fingerprint clé:", createHash("sha256").update(apiKey).digest("hex").slice(0, 8));
  process.exit(0);
}

console.log(`
============================================================
  Wazo — même numéro via 360dialog (coexistence)
============================================================

À FAIRE SUR TON ORDI + TÉLÉPHONE (toi seul, Facebook).
Ne clique JAMAIS « Ajouter un numéro » dans developers.facebook.com.

1. WhatsApp Business à jour. Téléphone avec caméra à côté.

2. Compte 360dialog (accès API, PAS le marketplace chatbot) :
   ${SIGNUP}
   Email : jacquesnoussougan93@gmail.com
   Ensuite : « Direct API Access » (pas Marketplace).
   Pays : Togo. Entreprise : Wazo Digital.
   Carte pour l'abonnement 360dialog (Meta facture les conversations à part).

3. Hub → Add channel / Add number
   Numéro : +228 93 92 40 40
   « Yes, Business App »  (OUI, déjà sur WhatsApp Business)
   PAS « new number » / SMS de vérif (ça vide le téléphone).

4. Popup Meta → Connect a WhatsApp Business App
   Portfolio : Wazo Digital (celui que tu as déjà).
   Un message Facebook arrive dans WhatsApp Business.
   Scanne le QR de l'écran. Historique : tu peux refuser.

5. Hub → le canal +228… → API Settings → Generate API Key
   Copie la clé UNE fois.

6. Colle dans Landing/.env.local :
   WHATSAPP_360DIALOG_API_KEY=la_clé
   (WHATSAPP_VERIFY_TOKEN est déjà écrit ici)

7. Dis-moi « clé prête » — je pousse Vercel + npm run wa:webhook
   Webhook : ${WEBHOOK}

Login ensuite : ${HUB}

Après : n'efface pas WhatsApp Business. Ouvre l'app au moins tous les 13 jours.
`);
