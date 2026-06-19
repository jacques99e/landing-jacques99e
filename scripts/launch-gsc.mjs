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
      console.log(`[ok] Balise HTML en production (content="${live[1].slice(0, 8)}…")`);
    } else if (gsc) {
      console.log("[!!] Code local présent mais balise absente en prod — redéployez landing + setup:vercel-landing");
    }
  } catch (e) {
    console.log(`[!!] Impossible de lire la page d'accueil : ${e.message}`);
  }

  try {
    const { Resolver } = await import("node:dns").then((m) => m.promises);
    const resolver = new Resolver();
    resolver.setServers(["8.8.8.8", "1.1.1.1"]);
    const txts = await resolver.resolveTxt("wazo-digital.com");
    const flat = txts.map((parts) => parts.join(""));
    const googleTxt = flat.find((t) => t.startsWith("google-site-verification="));
    if (googleTxt) {
      console.log(`[ok] Enregistrement TXT DNS détecté (${googleTxt.slice(0, 40)}…)`);
    } else {
      console.log("[ ] TXT google-site-verification pas encore propagé (attendre 5–30 min après ajout DNS)");
    }
  } catch (e) {
    console.log(`[ ] Vérification TXT DNS : ${e.message}`);
  }

  console.log(`
Étapes Search Console :
1. https://search.google.com/search-console
2. Propriété : ${SITE}
3. Méthode TXT (recommandée) — enregistrement déjà ajouté sur Vercel DNS :
   Type TXT · Nom @ · Valeur google-site-verification=<votre-code>
   OU méthode « Balise HTML » (déjà active en production)
4. Cliquer « Vérifier »
5. Soumettre le sitemap : ${SITE}/sitemap.xml

IndexNow (Bing) : automatique via cron app /api/cron/submit-indexing
`);
}

main();
