import { createHash } from "crypto";
import { SITE_URL } from "@/lib/seo";

export function resolveSiteUrl(): string {
  return SITE_URL;
}

/** Clé stable : INDEXNOW_KEY ou dérivée de CRON_SECRET (aucune config manuelle Search Console). */
export function resolveIndexNowKey(host: string): string | null {
  const explicit = process.env.INDEXNOW_KEY?.trim();
  if (explicit) return explicit;
  const cron = process.env.CRON_SECRET?.trim();
  if (!cron) return null;
  return createHash("sha256").update(`${cron}:${host}:indexnow`).digest("hex").slice(0, 32);
}

export function indexNowKeyLocation(siteUrl: string): string {
  return `${siteUrl.replace(/\/$/, "")}/indexnow-key.txt`;
}

export function parseSitemapLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1].trim());
}

export async function fetchSitemapUrls(sitemapUrl: string): Promise<string[]> {
  const res = await fetch(sitemapUrl, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Sitemap inaccessible (${res.status})`);
  }
  return parseSitemapLocs(await res.text());
}

export async function submitToIndexNow(
  siteUrl: string,
  urls: string[]
): Promise<{ submitted: number; status: number; skipped: boolean }> {
  const normalized = siteUrl.replace(/\/$/, "");
  const host = new URL(normalized).host;
  const key = resolveIndexNowKey(host);
  if (!key || urls.length === 0) {
    return { submitted: 0, status: 0, skipped: true };
  }

  const batch = urls.slice(0, 10_000);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key,
      keyLocation: indexNowKeyLocation(normalized),
      urlList: batch,
    }),
  });

  return { submitted: batch.length, status: res.status, skipped: false };
}

export async function pingBingSitemap(sitemapUrl: string): Promise<number> {
  const pingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
  const res = await fetch(pingUrl, { method: "GET", cache: "no-store" });
  return res.status;
}

export async function runIndexingForSite(siteUrl: string) {
  const base = siteUrl.replace(/\/$/, "");
  const sitemapUrl = `${base}/sitemap.xml`;
  const urls = await fetchSitemapUrls(sitemapUrl);
  const indexNow = await submitToIndexNow(base, urls);
  const bingPing = await pingBingSitemap(sitemapUrl);
  return { site: base, sitemapUrl, urlCount: urls.length, indexNow, bingPing };
}
