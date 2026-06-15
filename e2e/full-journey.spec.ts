import { test, expect } from "@playwright/test";
import { ensureAppSession, visitAppRoute } from "./auth-handoff";
import { resolveAppUrl } from "./urls.mjs";

const APP_URL = resolveAppUrl();

const MODULE_ROUTES: Record<string, string[]> = {
  commerce: ["/products", "/sales", "/clients"],
  agriculture: ["/agriculture", "/agriculture/parcels/new"],
  health: ["/health", "/health/patients/new", "/health/appointments"],
  logistics: ["/logistics", "/logistics/deliveries/new"],
  education: ["/education", "/education/courses/new"],
  blockchain: ["/blockchain", "/blockchain/assets/new"],
};

test.beforeAll(() => {
  if (!process.env.E2E_TEST_EMAIL) {
    test.skip(true, "Définissez E2E_TEST_EMAIL pour le parcours authentifié.");
  }
});

test.describe.serial("Parcours E2E — tous les modules", () => {
  test("1. Dashboard accessible après connexion (handoff landing → app)", async ({ page }) => {
    await ensureAppSession(page);
    await expect(page).toHaveURL(/dashboard|setup/);
  });

  test("2. Dashboard affiche du contenu", async ({ page }) => {
    await ensureAppSession(page);
    await expect(page.locator("body")).not.toBeEmpty();
  });

  for (const [moduleId, routes] of Object.entries(MODULE_ROUTES)) {
    test(`3.${moduleId} — pages accessibles`, async ({ page }) => {
      await ensureAppSession(page);

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
    await ensureAppSession(page);
    await page.goto(`${APP_URL}/settings/notifications`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Notifications|Rapport|push/i).first()).toBeVisible();

    await page.goto(`${APP_URL}/settings/team`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Équipe|rôles|collaborateur/i).first()).toBeVisible();
  });

  test("5. Portails publics", async ({ page }) => {
    for (const route of ["/suivi", "/formation", "/trace"]) {
      const res = await page.goto(`${APP_URL}${route}`, { waitUntil: "domcontentloaded" });
      expect(res?.status(), route).toBeLessThan(500);
    }
  });
});
