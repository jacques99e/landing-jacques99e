import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const APP_URL = process.env.E2E_APP_URL || "https://app.wazo-digital.com";
const AUTH_FILE = path.join(process.cwd(), "e2e", ".auth", "user.json");

test.beforeAll(() => {
  if (!fs.existsSync(AUTH_FILE)) {
    test.skip(true, "Session E2E non créée — définissez E2E_TEST_EMAIL.");
  }
});

test.describe("Abonnement — plans PRO et BUSINESS", () => {
  test("page /billing affiche les montants et badges", async ({ page }) => {
    await page.goto(`${APP_URL}/billing`);
    await page.waitForLoadState("domcontentloaded");
    if (page.url().includes("/login")) {
      throw new Error("Session expirée — relancez avec E2E_TEST_EMAIL.");
    }

    await expect(page.getByText("GRATUIT", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("PRO", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("BUSINESS", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Recommandé").first()).toBeVisible();
    await expect(page.getByText("Équipes & multi-sites").first()).toBeVisible();
    await expect(page.getByText(/6[\s\u00a0]?550/).first()).toBeVisible();
    await expect(page.getByText(/16[\s\u00a0]?350/).first()).toBeVisible();
  });

  test("?plan=business sans pay=1 ne redirige pas vers MoMo", async ({ page }) => {
    await page.goto(`${APP_URL}/billing?plan=business`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/billing/);
    await expect(page.getByText("BUSINESS", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/Redirection vers le paiement Mobile Money/i)).toHaveCount(0);
  });

  test("boutons Payer PRO et BUSINESS visibles", async ({ page }) => {
    await page.goto(`${APP_URL}/billing`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("button", { name: /Payer — Choisir PRO/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Payer — Passer au BUSINESS/i })).toBeVisible();
  });
});
