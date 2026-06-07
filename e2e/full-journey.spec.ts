import { test, expect, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";

const APP_URL = process.env.E2E_APP_URL || "https://wazo-digital.vercel.app";
const AUTH_FILE = path.join(process.cwd(), "e2e", ".auth", "user.json");

const MODULE_ROUTES: Record<string, string[]> = {
  commerce: ["/products", "/sales", "/clients"],
  agriculture: ["/agriculture", "/agriculture/parcels/new"],
  health: ["/health", "/health/patients/new", "/health/appointments"],
  logistics: ["/logistics", "/logistics/deliveries/new"],
  education: ["/education", "/education/courses/new"],
  blockchain: ["/blockchain", "/blockchain/assets/new"],
};

test.beforeAll(() => {
  if (!fs.existsSync(AUTH_FILE)) {
    const errFile = path.join(process.cwd(), "e2e", ".auth", "setup-error.txt");
    const detail = fs.existsSync(errFile) ? fs.readFileSync(errFile, "utf8") : "unknown";
    test.skip(true, `Session E2E non créée. ${detail}`);
  }
});

async function dismissGuidedOnboarding(page: Page) {
  const skip = page.getByRole("button", { name: /Passer pour l'instant/i });
  if (await skip.isVisible({ timeout: 3000 }).catch(() => false)) {
    await skip.click();
  }
}

async function openAppDashboard(page: Page) {
  await page.goto(`${APP_URL}/dashboard`);
  await page.waitForURL(/dashboard|setup|login/, { timeout: 30_000 });
  if (page.url().includes("/login")) {
    throw new Error("Session expirée — relancez npm run test:e2e");
  }
  await dismissGuidedOnboarding(page);
}

async function visitAppRoute(page: Page, route: string) {
  await page.goto(`${APP_URL}${route}`);
  await page.waitForLoadState("domcontentloaded");
  const url = page.url();
  if (url.includes("/login")) {
    throw new Error(`Redirigé vers login sur ${route}`);
  }
  return url;
}

test.describe.serial("Parcours E2E — tous les modules", () => {
  test("1. Dashboard accessible après connexion", async ({ page }) => {
    await openAppDashboard(page);
    await expect(page).toHaveURL(/dashboard/);
  });

  test("2. Dashboard affiche du contenu", async ({ page }) => {
    await openAppDashboard(page);
    await expect(page.locator("body")).not.toBeEmpty();
  });

  for (const [moduleId, routes] of Object.entries(MODULE_ROUTES)) {
    test(`3.${moduleId} — pages accessibles`, async ({ page }) => {
      await openAppDashboard(page);

      for (const route of routes) {
        const finalUrl = await visitAppRoute(page, route);
        expect(finalUrl, `${moduleId}: ${route} ne doit pas rediriger hors module`).toMatch(
          new RegExp(route.replace(/\//g, "\\/"))
        );
        await expect(page.locator("body")).not.toBeEmpty();
      }
    });
  }

  test("4. Paramètres notifications et équipe", async ({ page }) => {
    await openAppDashboard(page);
    await page.goto(`${APP_URL}/settings/notifications`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText(/Notifications|Rapport|push/i).first()).toBeVisible();

    await page.goto(`${APP_URL}/settings/team`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText(/Équipe|rôles|collaborateur/i).first()).toBeVisible();
  });

  test("5. Portails publics", async ({ page }) => {
    for (const route of ["/suivi", "/formation", "/trace"]) {
      const res = await page.goto(`${APP_URL}${route}`);
      expect(res?.status(), route).toBeLessThan(500);
    }
  });
});
