#!/usr/bin/env node
/**
 * Publie (ou simule) un post Facebook/Instagram Wazo.
 * Usage:
 *   node scripts/social-post.mjs              # post du jour (dry-run)
 *   node scripts/social-post.mjs register     # dry-run
 *   node scripts/social-post.mjs register --live
 *   node scripts/social-post.mjs --cron       # appelle l'API prod
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const POSTS = JSON.parse(
  fs.readFileSync(path.join(ROOT, "lib", "social-posts.json"), "utf8")
);

function loadEnv() {
  const out = {};
  for (const file of [
    path.join(ROOT, ".env.local"),
    path.join(ROOT, "..", "wazo-digital", ".env.local"),
  ]) {
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

function pickKey(arg) {
  if (arg && POSTS[arg]) return arg;
  const day = new Date().getUTCDay();
  if (day === 3) return "pilote";
  if (day === 5) return "pro";
  return "register";
}

async function graphPost(version, pathName, token, body) {
  const url = new URL(`https://graph.facebook.com/${version}${pathName}`);
  url.searchParams.set("access_token", token);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });
  const raw = await res.json().catch(() => ({}));
  if (!res.ok || raw.error) {
    return { ok: false, error: raw.error?.message || `HTTP ${res.status}`, raw };
  }
  return { ok: true, id: raw.id, raw };
}

async function publishLive(env, post) {
  const pageId = env.META_PAGE_ID?.trim();
  const token = env.META_PAGE_ACCESS_TOKEN?.trim();
  const version = env.META_GRAPH_VERSION?.trim() || "v21.0";
  if (!pageId || !token) {
    throw new Error("META_PAGE_ID / META_PAGE_ACCESS_TOKEN manquants (.env.local)");
  }

  const fb = await graphPost(version, `/${pageId}/feed`, token, {
    message: post.message,
    link: post.link,
  });
  console.log(fb.ok ? `[ok] Facebook id=${fb.id}` : `[fail] Facebook: ${fb.error}`);

  const igId = env.META_INSTAGRAM_ACCOUNT_ID?.trim();
  const igImage = env.META_IG_IMAGE_URL?.trim();
  if (!igId || !igImage) {
    console.log("[skip] Instagram — META_INSTAGRAM_ACCOUNT_ID / META_IG_IMAGE_URL");
    return;
  }

  const caption = `${post.message}\n\n${post.link}`;
  const container = await graphPost(version, `/${igId}/media`, token, {
    image_url: igImage,
    caption,
  });
  if (!container.ok) {
    console.log(`[fail] Instagram container: ${container.error}`);
    return;
  }
  const published = await graphPost(version, `/${igId}/media_publish`, token, {
    creation_id: container.id,
  });
  console.log(
    published.ok
      ? `[ok] Instagram id=${published.id}`
      : `[fail] Instagram publish: ${published.error}`
  );
}

async function callCron(env, key, live) {
  const base = env.LANDING_URL?.trim() || "https://wazo-digital.com";
  const secret = env.CRON_SECRET?.trim();
  if (!secret) throw new Error("CRON_SECRET manquant");
  const url = new URL("/api/cron/social-post", base);
  url.searchParams.set("key", key);
  if (!live) url.searchParams.set("dryRun", "1");
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const body = await res.json().catch(() => ({}));
  console.log(JSON.stringify(body, null, 2));
  if (!res.ok) process.exit(1);
}

async function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith("--")));
  const live = flags.has("--live");
  const viaCron = flags.has("--cron");
  const key = pickKey(args[0]);
  const post = POSTS[key];
  const env = loadEnv();

  console.log(`=== Social post « ${key} » ${live ? "(LIVE)" : "(dry-run)"} ===\n`);
  console.log(post.message);
  console.log(`\nLien: ${post.link}\n`);

  if (viaCron) {
    await callCron(env, key, live);
    return;
  }

  if (!live) {
    console.log("Dry-run OK. Relancez avec --live pour publier.");
    console.log("Ou: npm run social:post -- register --live");
    return;
  }

  if (env.SOCIAL_POST_ENABLED?.trim() !== "1") {
    console.error("Refuse: mettez SOCIAL_POST_ENABLED=1 dans .env.local");
    process.exit(1);
  }

  await publishLive(env, post);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
