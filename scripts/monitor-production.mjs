#!/usr/bin/env node
/**
 * Surveillance production Wazo (landing + app).
 * Usage:
 *   node scripts/monitor-production.mjs
 *   RUN_E2E=1 node scripts/monitor-production.mjs
 *   MONITOR_WEBHOOK_URL=https://... node scripts/monitor-production.mjs
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const LANDING_HEALTH =
  process.env.MONITOR_LANDING_URL?.trim() || "https://wazo-digital.com/api/health";
const APP_HEALTH =
  process.env.MONITOR_APP_URL?.trim() || "https://app.wazo-digital.com/api/health";
const WEBHOOK = process.env.MONITOR_WEBHOOK_URL?.trim();
const RUN_E2E =
  process.argv.includes("--e2e") ||
  process.env.RUN_E2E === "1" ||
  process.env.RUN_E2E === "true";
const TIMEOUT_MS = Number(process.env.MONITOR_TIMEOUT_MS || 30_000);

const failures = [];

async function fetchHealth(name, url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.ok !== true) {
      failures.push(`${name}: HTTP ${res.status} — ${JSON.stringify(body)}`);
      return null;
    }
    console.log(`[ok] ${name} v${body.version ?? "?"} (${url})`);
    if (name === "app" && body.crons?.configured === false) {
      failures.push("app: CRON_SECRET manquant sur Vercel (crons désactivés)");
    }
    if (name === "app" && body.serviceRole === false) {
      failures.push("app: SUPABASE_SERVICE_ROLE_KEY manquant sur Vercel");
    }
    return body;
  } catch (err) {
    failures.push(`${name}: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function notifyWebhook() {
  if (!WEBHOOK || failures.length === 0) return;
  const text = `Wazo monitor ALERT\n${failures.join("\n")}`;
  try {
    await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, failures }),
    });
  } catch {
    // optional
  }
}

function runE2E() {
  const root = path.dirname(fileURLToPath(import.meta.url));
  const landingRoot = path.resolve(root, "..");
  console.log("[e2e] Running production smoke (health + APIs)...");
  const result = spawnSync(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "test:e2e:production", "--", "--grep", "APIs publiques|APIs métier"],
    {
      cwd: landingRoot,
      stdio: "inherit",
      shell: process.platform === "win32",
      env: { ...process.env, FORCE_COLOR: "0" },
    }
  );
  if (result.status !== 0) {
    failures.push("E2E: production API tests failed (see log above)");
  } else {
    console.log("[ok] E2E production APIs");
  }
}

async function main() {
  console.log(`[monitor] ${new Date().toISOString()}`);
  await fetchHealth("landing", LANDING_HEALTH);
  await fetchHealth("app", APP_HEALTH);

  if (RUN_E2E) runE2E();

  await notifyWebhook();

  if (failures.length) {
    console.error("\n[FAIL]", failures.join("\n"));
    process.exit(1);
  }
  console.log("\n[monitor] All checks passed.");
}

main();
