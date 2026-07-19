#!/usr/bin/env node
/**
 * Assistant de connexion Meta (Facebook Page + Instagram).
 * Usage:
 *   npm run meta:connect
 *   npm run meta:connect -- <USER_ACCESS_TOKEN_COURT>
 *
 * Prérequis : App Meta + Page Facebook + Instagram Pro lié à la Page.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const GRAPH = "https://graph.facebook.com/v21.0";

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

function loadEnv() {
  return {
    ...loadEnvFile(path.join(ROOT, ".env.local")),
    ...process.env,
  };
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(String(answer || "").trim());
    });
  });
}

async function graphGet(pathname, token, params = {}) {
  const url = new URL(`${GRAPH}${pathname}`);
  url.searchParams.set("access_token", token);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `HTTP ${res.status}`);
  }
  return data;
}

function printGuide() {
  console.log(`
============================================================
  Wazo Digital — Connexion Facebook / Instagram (pas à pas)
============================================================

Tu vas créer UNE fois les clés Meta. Ensuite le site posterà tout seul.

ÉTAPE A — Compte Instagram Pro + Page Facebook
  1. Instagram → Profil → Menu → Compte professionnel ou créateur
  2. Crée (ou utilise) une Page Facebook « Wazo Digital »
  3. Lie Instagram à cette Page :
     Facebook → ta Page → Paramètres → Compte Instagram lié

ÉTAPE B — App Meta (developers.facebook.com)
  1. Va sur https://developers.facebook.com/apps/
  2. « Créer une application » → type « Business »
  3. Nom : Wazo Digital Social
  4. Dans l'app → Ajouter le produit « Facebook Login » (ou Graph API)
  5. Paramètres → Général :
     - copie Identifiant de l'app (APP_ID)
     - copie Clé secrète de l'app (APP_SECRET)
  6. Rôles → Ajoute-toi comme Administrateur
  7. Mode Développement = OK pour poster sur TA Page (tu dois être admin Page + app)

ÉTAPE C — Jeton utilisateur (Graph API Explorer)
  1. Ouvre https://developers.facebook.com/tools/explorer/
  2. Sélectionne ton app « Wazo Digital Social »
  3. « Generate Access Token » / Générer un jeton
  4. Coche ces permissions :
     - pages_show_list
     - pages_read_engagement
     - pages_manage_posts
     - pages_manage_metadata
     - instagram_basic
     - instagram_content_publish
     - business_management
  5. Autorise avec le compte Facebook admin de la Page
  6. Copie le jeton affiché (il expire vite — on le convertit juste après)

ÉTAPE D — Ce script
  - colle APP_ID + APP_SECRET dans Landing/.env.local (voir modèle)
  - relance : npm run meta:connect
  - colle le jeton utilisateur quand demandé
  - le script affiche META_PAGE_ID, META_PAGE_ACCESS_TOKEN, META_IG_USER_ID
  - tu les colles dans .env.local ET sur Vercel (Landing)

Puis : npm run meta:post -- --dry-run
Puis : npm run meta:post -- --live
Puis mets META_SOCIAL_ENABLED=1 sur Vercel pour l'auto-post (cron)
`);
}

function upsertEnvLocal(vars) {
  const envPath = path.join(ROOT, ".env.local");
  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  for (const [key, value] of Object.entries(vars)) {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, "m");
    if (re.test(content)) {
      content = content.replace(re, line);
    } else {
      content = `${content.trimEnd()}\n\n# Meta Social (auto)\n${line}\n`;
    }
  }
  fs.writeFileSync(envPath, content.endsWith("\n") ? content : `${content}\n`);
  console.log(`\n[ok] Écrit dans .env.local : ${Object.keys(vars).join(", ")}`);
}

async function main() {
  const env = loadEnv();
  const flag = process.argv[2];

  if (flag === "--guide" || flag === "guide") {
    printGuide();
    return;
  }

  printGuide();

  let appId = env.META_APP_ID?.trim();
  let appSecret = env.META_APP_SECRET?.trim();

  if (!appId) appId = await ask("META_APP_ID (Identifiant de l'app) : ");
  if (!appSecret) appSecret = await ask("META_APP_SECRET (Clé secrète) : ");

  if (!appId || !appSecret) {
    console.error("\n[fail] APP_ID et APP_SECRET sont obligatoires.");
    process.exit(1);
  }

  let userToken = process.argv[2]?.trim();
  if (!userToken || userToken.startsWith("--")) {
    userToken = await ask("\nColle le jeton utilisateur (Graph API Explorer) : ");
  }

  if (!userToken) {
    console.error("[fail] Jeton manquant.");
    process.exit(1);
  }

  console.log("\n1) Échange → jeton longue durée (≈60 jours)...");
  const exchangeUrl = new URL(`${GRAPH}/oauth/access_token`);
  exchangeUrl.searchParams.set("grant_type", "fb_exchange_token");
  exchangeUrl.searchParams.set("client_id", appId);
  exchangeUrl.searchParams.set("client_secret", appSecret);
  exchangeUrl.searchParams.set("fb_exchange_token", userToken);
  const exchangeRes = await fetch(exchangeUrl.toString());
  const exchange = await exchangeRes.json().catch(() => ({}));
  if (!exchangeRes.ok || exchange.error || !exchange.access_token) {
    console.error("[fail] Échange token:", exchange.error?.message || exchange);
    process.exit(1);
  }
  const longUserToken = exchange.access_token;
  console.log("   [ok] Jeton utilisateur longue durée obtenu");

  console.log("\n2) Liste des Pages Facebook...");
  const accounts = await graphGet("/me/accounts", longUserToken, {
    fields: "id,name,access_token,instagram_business_account",
  });
  const pages = accounts.data || [];
  if (!pages.length) {
    console.error(
      "[fail] Aucune Page trouvée. Vérifie que ton compte est admin d'une Page Facebook."
    );
    process.exit(1);
  }

  pages.forEach((p, i) => {
    const ig = p.instagram_business_account?.id || "— (pas d'IG lié)";
    console.log(`   [${i + 1}] ${p.name}  page=${p.id}  ig=${ig}`);
  });

  let index = 0;
  if (pages.length > 1) {
    const choice = await ask(`\nQuelle Page ? (1-${pages.length}) : `);
    index = Math.max(0, Math.min(pages.length - 1, Number(choice) - 1 || 0));
  }
  const page = pages[index];

  let igUserId = page.instagram_business_account?.id;
  if (!igUserId) {
    try {
      const detail = await graphGet(`/${page.id}`, page.access_token, {
        fields: "instagram_business_account",
      });
      igUserId = detail.instagram_business_account?.id;
    } catch {
      /* ignore */
    }
  }

  console.log("\n============================================================");
  console.log("  COLLER CES VALEURS (Landing .env.local + Vercel)");
  console.log("============================================================\n");
  console.log(`META_APP_ID=${appId}`);
  console.log(`META_APP_SECRET=${appSecret}`);
  console.log(`META_PAGE_ID=${page.id}`);
  console.log(`META_PAGE_ACCESS_TOKEN=${page.access_token}`);
  if (igUserId) {
    console.log(`META_IG_USER_ID=${igUserId}`);
  } else {
    console.log("# META_IG_USER_ID=  ← lie Instagram Pro à la Page, puis relance meta:connect");
  }
  console.log("META_SOCIAL_ENABLED=0");
  console.log("META_POST_FACEBOOK=1");
  console.log(`META_POST_INSTAGRAM=${igUserId ? "1" : "0"}`);
  console.log("META_SOCIAL_IMAGE_URL=https://wazo-digital.com/social-card.png");
  console.log("\n# Quand le test --live marche : mets META_SOCIAL_ENABLED=1 sur Vercel");

  const save = await ask("\nÉcrire automatiquement dans .env.local ? (o/N) : ");
  if (save.toLowerCase() === "o" || save.toLowerCase() === "oui" || save.toLowerCase() === "y") {
    const vars = {
      META_APP_ID: appId,
      META_APP_SECRET: appSecret,
      META_PAGE_ID: page.id,
      META_PAGE_ACCESS_TOKEN: page.access_token,
      META_SOCIAL_ENABLED: "0",
      META_POST_FACEBOOK: "1",
      META_POST_INSTAGRAM: igUserId ? "1" : "0",
      META_SOCIAL_IMAGE_URL: "https://wazo-digital.com/social-card.png",
    };
    if (igUserId) vars.META_IG_USER_ID = igUserId;
    upsertEnvLocal(vars);
  }

  console.log(`
Suite :
  1) npm run meta:post -- --dry-run
  2) npm run meta:post -- --live          ← publie pour de vrai (1 post test)
  3) Sur Vercel (projet Landing) → Settings → Environment Variables
     colle les mêmes META_* (Production)
  4) META_SOCIAL_ENABLED=1
  5) Redeploy Landing

Le cron publie 3×/semaine (lun / mer / ven à 10:00 UTC).
`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
