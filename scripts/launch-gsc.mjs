#!/usr/bin/env node
/**
 * Guide Google Search Console + vérifs SEO rapides.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const SITE = "https://wazo-digital.com";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const paths = [
    path.join(ROOT, ".env.local"),
    path.join(ROOT, "..", "wazo-digital", ".env.local"),
  ];
  const out = {};
  for (const envPath of paths) {
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
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
  const env = loadEnv();
  if (env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION) {
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION = env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  }
  console.log("=== Google Search Console — Wazo Digital ===\n");

  const checks = [
    { name: "sitemap.xml", url: `${SITE}/sitemap.xml` },
    { name: "robots.txt", url: `${SITE}/robots.txt` },
    { name: "indexnow-key.txt", url: `${SITE}/indexnow-key.txt` },
  ];

  for (const { name, url } of checks) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      console.log(res.ok ? `[ok] ${name} → ${res.status}` : `[!!] ${name} → ${res.status}`);
    } catch (e) {
      console.log(`[!!] ${name} → ${e.message}`);
    }
  }

  const gsc = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
  console.log(
    gsc
      ? "\n[ok] NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION défini localement"
      : "\n[ ] Balise Google non configurée (voir ci-dessous)"
  );

  try {
    const html = await fetch(SITE, { cache: "no-store" }).then((r) => r.text());
    const live = html.match(/google-site-verification" content="([^"]+)"/);
    if (live) {
      console.log(`[ok] Balise Google détectée en production (content="${live[1].slice(0, 8)}…")`);
      console.log("\n→ Reste à faire dans Search Console :");
      console.log("  1. Cliquer « Vérifier » sur la propriété https://wazo-digital.com");
      console.log(`  2. Soumettre le sitemap : ${SITE}/sitemap.xml`);
    } else if (gsc) {
      console.log("[!!] Code local présent mais balise absente en prod — redéployez landing + setup:vercel-landing");
    }
  } catch (e) {
    console.log(`[!!] Impossible de lire la page d'accueil : ${e.message}`);
  }

  console.log(`
Étapes (15 min) :
1. https://search.google.com/search-console
2. Ajouter la propriété : ${SITE}
3. Méthode « Balise HTML » → copier le code content="..."
4. Vercel (projet landing) :
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<votre-code>
5. Redéployer landing, puis « Vérifier » dans Search Console
6. Soumettre le sitemap : ${SITE}/sitemap.xml

IndexNow (Bing) : automatique via cron app /api/cron/submit-indexing
`);
}

main();
