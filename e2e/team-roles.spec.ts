import { test, expect } from "@playwright/test";
import { loginToApp, dismissOnboarding } from "./helpers/auth.mjs";

const APP_URL = process.env.E2E_APP_URL || "https://wazo-digital.vercel.app";

const OWNER = {
  email: process.env.E2E_OWNER_EMAIL || "test.owner@wazo.africa",
  password: process.env.E2E_OWNER_PASSWORD || "TestOwner2026!",
};

const EMPLOYEE = {
  email: process.env.E2E_EMPLOYEE_EMAIL || "test.employee@wazo.africa",
  password: process.env.E2E_EMPLOYEE_PASSWORD || "TestEmployee2026!",
};

test.describe("Rôles équipe — comptes test prod", () => {
  test("propriétaire voit l'équipe et l'employé invité", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await loginToApp(page, { ...OWNER, appUrl: APP_URL });
    await page.goto(`${APP_URL}/settings/team`);
    await dismissOnboarding(page);
    await expect(page.getByRole("heading", { name: /Équipe/i }).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("heading", { name: "Inviter un membre" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Membres \(\d+\)/ })).toBeVisible();
    await expect(page.getByText(/Employé|employee/i).first()).toBeVisible({ timeout: 15_000 });

    await context.close();
  });

  test("employé voit son rôle sans gestion d'équipe", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await loginToApp(page, { ...EMPLOYEE, appUrl: APP_URL });
    await page.goto(`${APP_URL}/settings/team`);
    await dismissOnboarding(page);
    await expect(page.getByText("Votre rôle sur cette boutique")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Employé")).toBeVisible();
    await expect(page.getByText("Membres de l'équipe")).not.toBeVisible();
    await expect(page.getByPlaceholder("+221")).not.toBeVisible();

    await context.close();
  });

  test("employé accède à la caisse", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await loginToApp(page, { ...EMPLOYEE, appUrl: APP_URL });
    await dismissOnboarding(page);
    await page.getByRole("link", { name: /Ventes/i }).click();
    await page.waitForURL(/\/sales/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: /Caisse|Vente/i }).first()).toBeVisible({
      timeout: 20_000,
    });

    await context.close();
  });
});
