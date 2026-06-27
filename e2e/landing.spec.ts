import { test, expect } from "@playwright/test";

const MODULES = [
  "commerce",
  "agriculture",
  "health",
  "logistics",
  "education",
  "blockchain",
];

test.describe("Landing — pages publiques", () => {
  test("accueil et sections clés", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Tout votre métier, une seule app")).toBeVisible();
    await expect(page.getByText("Pourquoi Wazo Digital")).toBeVisible();
    await expect(page.getByText("Ils utilisent l'app")).toBeVisible();
    await expect(page.getByText("Tarifs simples")).toBeVisible();
  });

  test("page tarifs détaillée", async ({ page }) => {
    await page.goto("/tarifs");
    await expect(page.getByRole("heading", { name: /Tarifs Wazo Digital/i })).toBeVisible();
    await expect(page.getByText("Comparaison détaillée")).toBeVisible();
    await expect(page.getByText("GRATUIT", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("PRO", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("BUSINESS", { exact: true }).first()).toBeVisible();
  });

  test("liens inscription par module", async ({ page }) => {
    for (const mod of MODULES) {
      await page.goto(`/register?module=${mod}`);
      await expect(page.getByRole("heading", { name: /Creer un compte/i })).toBeVisible();
    }
  });

  test("connexion email et Google sans option SMS", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Connexion/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Continuer avec Google/i })).toBeVisible();
    await expect(page.getByText(/numero de telephone/i)).toHaveCount(0);
  });

  test("phone-login redirige vers login", async ({ page }) => {
    await page.goto("/phone-login");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("robots.txt et sitemap.xml accessibles", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    const robotsBody = await robots.text();
    expect(robotsBody).toContain("Sitemap:");
    expect(robotsBody).toContain("wazo-digital.com/sitemap.xml");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    const sitemapBody = await sitemap.text();
    expect(sitemapBody).toContain("wazo-digital.com");
    expect(sitemapBody).toContain("/tarifs");
    expect(sitemapBody).toContain("/mentions-legales");
    expect(sitemapBody).toContain("/confidentialite");
  });

  test("pages légales accessibles", async ({ page }) => {
    await page.goto("/mentions-legales");
    await expect(page.getByRole("heading", { name: /Mentions légales/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Confidentialité/i })).toBeVisible();

    await page.goto("/confidentialite");
    await expect(page.getByRole("heading", { name: /Politique de confidentialité/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Mentions légales/i })).toBeVisible();
  });

  test("indexnow-key.txt accessible si CRON_SECRET configure", async ({ request }) => {
    const res = await request.get("/indexnow-key.txt");
    expect([200, 404]).toContain(res.status());
  });
});
