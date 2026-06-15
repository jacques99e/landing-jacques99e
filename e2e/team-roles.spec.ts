import { test, expect } from "@playwright/test";
import { loginToApp, dismissOnboarding } from "./helpers/auth.mjs";

const APP_URL = process.env.E2E_APP_URL || "https://app.wazo-digital.com";

const OWNER = {
  email: process.env.E2E_OWNER_EMAIL || "test.owner@wazo.africa",
  password: process.env.E2E_OWNER_PASSWORD || "TestOwner2026!",
};

const EMPLOYEE = {
  email: process.env.E2E_EMPLOYEE_EMAIL || "test.employee@wazo.africa",
  password: process.env.E2E_EMPLOYEE_PASSWORD || "TestEmployee2026!",
};

async function visitAppRoute(page: import("@playwright/test").Page, appUrl: string, route: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.goto(`${appUrl}${route}`, { waitUntil: "domcontentloaded" });
    } catch {
      // navigation interrupted by redirect — retry
    }
    if (page.url().includes(route)) return;
    await page.waitForTimeout(800);
  }
  await expect(page).toHaveURL(new RegExp(route.replace(/\//g, "\\/")));
}

async function visitTeamPage(page: import("@playwright/test").Page, appUrl: string) {
  await visitAppRoute(page, appUrl, "/settings/team");
}

test.describe("Rôles équipe — comptes test prod", () => {
  test("propriétaire voit l'équipe et l'employé invité", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await loginToApp(page, { ...OWNER, appUrl: APP_URL });
    await visitTeamPage(page, APP_URL);
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
    await page.waitForURL(/dashboard/, { timeout: 30_000 });
    await visitTeamPage(page, APP_URL);
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
    await visitAppRoute(page, APP_URL, "/sales");
    await dismissOnboarding(page);
    await expect(page).toHaveURL(/\/sales/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: /Caisse|Vente/i }).first()).toBeVisible({
      timeout: 20_000,
    });

    await context.close();
  });
});
