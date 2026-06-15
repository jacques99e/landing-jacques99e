import type { Page } from "@playwright/test";
import { resolveAppUrl, resolveLandingUrl } from "./urls.mjs";

const LANDING_URL = resolveLandingUrl();
const APP_URL = resolveAppUrl();

export async function dismissGuidedOnboarding(page: Page) {
  const skip = page.getByRole("button", { name: /Passer pour l'instant/i });
  if (await skip.isVisible({ timeout: 3000 }).catch(() => false)) {
    await skip.click();
  }
}

async function loginOnLanding(page: Page, email: string, password: string) {
  await page.goto(`${LANDING_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder("email@wazo.africa").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  const loginErr = page.locator("text=/Invalid login credentials|email not confirmed/i");
  if (await loginErr.isVisible({ timeout: 5000 }).catch(() => false)) {
    throw new Error("Connexion impossible — vérifiez e-mail/mot de passe Supabase.");
  }
}

async function waitForAppAfterHandoff(page: Page) {
  await page.waitForURL(/post-auth|auth\/receive|dashboard|setup|wazo-digital\.com\/login/, {
    timeout: 90_000,
  });

  if (page.url().includes("/post-auth")) {
    await page.waitForURL(/auth\/receive|dashboard|setup/, { timeout: 90_000 });
  }
  if (page.url().includes("/auth/receive")) {
    await page.waitForURL(/dashboard|setup/, { timeout: 90_000 });
  }
}

/** Connexion landing → handoff → session sur app.wazo-digital.com */
export async function ensureAppSession(page: Page) {
  await page.goto(`${APP_URL}/dashboard`, { waitUntil: "domcontentloaded", timeout: 60_000 });

  let url = page.url();
  if (url.includes("/dashboard")) {
    await dismissGuidedOnboarding(page);
    return;
  }

  if (url.includes("/setup")) {
    return;
  }

  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD || "TestOwner2026!";
  if (!email) {
    throw new Error("E2E_TEST_EMAIL requis pour le handoff landing → app.");
  }

  await loginOnLanding(page, email, password);
  await waitForAppAfterHandoff(page);

  url = page.url();
  if (url.includes("wazo-digital.com/login")) {
    throw new Error("Handoff échoué — toujours sur la page de connexion.");
  }
  if (!url.includes("/dashboard") && !url.includes("/setup")) {
    await page.goto(`${APP_URL}/dashboard`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  }

  await dismissGuidedOnboarding(page);
}

export async function visitAppRoute(page: Page, route: string) {
  await page.goto(`${APP_URL}${route}`, { waitUntil: "domcontentloaded" });
  const url = page.url();
  if (url.includes("/login") || url.includes("wazo-digital.com/login")) {
    await ensureAppSession(page);
    await page.goto(`${APP_URL}${route}`, { waitUntil: "domcontentloaded" });
  }
  if (page.url().includes("/login")) {
    throw new Error(`Redirigé vers login sur ${route}`);
  }
  return page.url();
}
