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
    await expect(page.getByRole("heading", { name: /Comment utiliser Wazo Digital/i })).toBeVisible();
    await expect(page.locator("video")).toBeVisible();
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
});
