#!/usr/bin/env node
/**
 * Guide Google Search Console + vérifs SEO rapides.
 */
const SITE = "https://wazo-digital.com";

async function main() {
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
  console.log(gsc ? "\n[ok] NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION défini localement" : "\n[ ] Balise Google non configurée (voir ci-dessous)");

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
