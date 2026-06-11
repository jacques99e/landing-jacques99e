import { test, expect } from "@playwright/test";

const APP_URL = process.env.E2E_APP_URL || "https://wazo-digital.vercel.app";
const LANDING_URL = process.env.E2E_LANDING_URL || "https://landing-jacques99e.vercel.app";

const MODULE_PAGES: Record<string, string[]> = {
  commerce: ["/products", "/sales", "/clients"],
  agriculture: ["/agriculture", "/agriculture/parcels/new", "/agriculture/marches"],
  health: ["/health", "/health/patients/new", "/health/appointments", "/health/appointments/new"],
  logistics: ["/logistics", "/logistics/deliveries/new"],
  education: ["/education", "/education/courses/new"],
  blockchain: ["/blockchain", "/blockchain/assets/new", "/blockchain/contracts"],
};

const PREMIUM_ROUTES = [
  "/nexus",
  "/sales/voice",
  "/sales/tontine",
  "/sales/credit",
  "/sales/liens",
  "/agriculture/radar",
  "/agriculture/calendrier",
  "/health/sentinel",
  "/health/pharmacie",
  "/logistics/fleet",
  "/logistics/tournee",
  "/education/badges",
  "/education/presence",
  "/blockchain/passport",
  "/blockchain/qr",
];

const APP_CORE = ["/dashboard", "/settings", "/settings/notifications", "/settings/team", "/help", "/analytics"];
const PUBLIC_APP = ["/suivi", "/formation", "/trace", "/login"];
const LANDING_PAGES = ["/", "/tarifs", "/register", "/login"];

test.describe("Smoke E2E — sans authentification", () => {
  for (const path of LANDING_PAGES) {
    test(`Landing ${path} répond`, async ({ request }) => {
      const res = await request.get(`${LANDING_URL}${path}`);
      expect(res.status(), path).toBeLessThan(500);
      expect(res.status(), path).toBeGreaterThanOrEqual(200);
    });
  }

  for (const path of PUBLIC_APP) {
    test(`App public ${path} répond`, async ({ request }) => {
      const res = await request.get(`${APP_URL}${path}`);
      expect(res.status(), path).toBeLessThan(500);
    });
  }

  for (const path of APP_CORE) {
    test(`App ${path} (protégé) répond ou redirige`, async ({ request }) => {
      const res = await request.get(`${APP_URL}${path}`, { maxRedirects: 0 });
      expect([200, 307, 308, 302, 301]).toContain(res.status());
    });
  }

  for (const route of PREMIUM_ROUTES) {
    test(`Premium — ${route} accessible (HTTP)`, async ({ request }) => {
      const res = await request.get(`${APP_URL}${route}`, { maxRedirects: 0 });
      expect(res.status(), route).toBeLessThan(500);
    });
  }

  for (const [module, routes] of Object.entries(MODULE_PAGES)) {
    for (const route of routes) {
      test(`Module ${module} — ${route} accessible (HTTP)`, async ({ request }) => {
        const res = await request.get(`${APP_URL}${route}`, { maxRedirects: 0 });
        expect(res.status(), route).toBeLessThan(500);
      });
    }
  }

  test("Inscription par module — liens landing", async ({ page }) => {
    for (const mod of Object.keys(MODULE_PAGES)) {
      await page.goto(`${LANDING_URL}/register?module=${mod}`);
      await expect(page.getByRole("heading", { name: /Creer un compte/i })).toBeVisible();
      await expect(page.getByText(/Module pré-sélectionné/i)).toBeVisible();
    }
  });
});
