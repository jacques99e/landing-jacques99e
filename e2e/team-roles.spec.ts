import { test, expect } from "@playwright/test";
import path from "path";

const APP_URL = process.env.E2E_APP_URL || "https://wazo-digital.vercel.app";
const LANDING_URL = process.env.E2E_LANDING_URL || "https://landing-jacques99e.vercel.app";

const OWNER = {
  email: process.env.E2E_OWNER_EMAIL || "test.owner@wazo.africa",
  password: process.env.E2E_OWNER_PASSWORD || "TestOwner2026!",
};

const EMPLOYEE = {
  email: process.env.E2E_EMPLOYEE_EMAIL || "test.employee@wazo.africa",
  password: process.env.E2E_EMPLOYEE_PASSWORD || "TestEmployee2026!",
};

async function loginViaLanding(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto(`${LANDING_URL}/login`);
  await page.getByPlaceholder("email@wazo.africa").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL(/post-auth|auth\/receive|dashboard|setup/, { timeout: 60_000 });
  if (page.url().includes("/post-auth")) {
    await page.waitForURL(/auth\/receive|dashboard|setup/, { timeout: 60_000 });
  }
  if (page.url().includes("/auth/receive")) {
    await page.waitForURL(/dashboard|setup/, { timeout: 60_000 });
  }
  const skip = page.getByRole("button", { name: /Passer pour l'instant/i });
  if (await skip.isVisible({ timeout: 3000 }).catch(() => false)) {
    await skip.click();
  }
}

test.describe("Rôles équipe — comptes test prod", () => {
  test("propriétaire voit l'équipe et l'employé invité", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await loginViaLanding(page, OWNER.email, OWNER.password);
    await page.goto(`${APP_URL}/settings/team`);
    await expect(page.getByText("Membres de l'équipe")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Test Employé|770000002/i)).toBeVisible();

    await context.close();
  });

  test("employé voit son rôle sans gestion d'équipe", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await loginViaLanding(page, EMPLOYEE.email, EMPLOYEE.password);
    await page.goto(`${APP_URL}/settings/team`);
    await expect(page.getByText("Votre rôle sur cette boutique")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Employé")).toBeVisible();
    await expect(page.getByText("Membres de l'équipe")).not.toBeVisible();
    await expect(page.getByPlaceholder("+221")).not.toBeVisible();

    await context.close();
  });

  test("employé accède à la caisse", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await loginViaLanding(page, EMPLOYEE.email, EMPLOYEE.password);
    await page.goto(`${APP_URL}/sales`);
    await expect(page).toHaveURL(/\/sales/);
    await expect(page.getByRole("heading", { name: /Caisse|Vente/i }).first()).toBeVisible({
      timeout: 20_000,
    });

    await context.close();
  });
});
