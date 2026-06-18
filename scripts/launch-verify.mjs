#!/usr/bin/env node
/**
 * Vérifie les parcours critiques prod (pages + billing API).
 */
import { fetchSession, loadEnv } from "../e2e/helpers/auth.mjs";

const APP = "https://app.wazo-digital.com";
const LANDING = "https://wazo-digital.com";

const PAGES = [
  [LANDING, "/register"],
  [LANDING, "/tarifs"],
  [LANDING, "/guide-pilote"],
  [APP, "/billing"],
  [APP, "/boutique/boutique-test-roles-wazo"],
];

async function checkPages() {
  console.log("=== Pages publiques ===\n");
  const issues = [];
  for (const [base, path] of PAGES) {
    const res = await fetch(`${base}${path}`, { redirect: "follow" });
    const ok = res.status < 500;
    console.log(ok ? `[ok] ${path} → ${res.status}` : `[!!] ${path} → ${res.status}`);
    if (!ok) issues.push(path);
  }
  return issues;
}

async function checkBillingApi() {
  console.log("\n=== Billing API (owner test) ===\n");
  const email = process.env.E2E_OWNER_EMAIL || "test.owner@wazo.africa";
  const password = process.env.E2E_OWNER_PASSWORD || "TestOwner2026!";
  try {
    const session = await fetchSession(email, password);
    const res = await fetch(`${APP}/api/billing/subscription`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      console.log(`[ok] GET /api/billing/subscription → ${res.status}`);
      console.log(`     plan: ${body.plan ?? body.subscription?.plan ?? "?"}`);
      return [];
    }
    console.log(`[!!] billing → ${res.status}`, JSON.stringify(body).slice(0, 120));
    return ["billing-api"];
  } catch (e) {
    console.log(`[!!] billing auth: ${e.message}`);
    return ["billing-auth"];
  }
}

const pageIssues = await checkPages();
const billingIssues = await checkBillingApi();

console.log("\n=== Résumé ===");
if (pageIssues.length === 0 && billingIssues.length === 0) {
  console.log("Parcours inscription / billing / pilote OK.");
} else {
  process.exit(1);
}
