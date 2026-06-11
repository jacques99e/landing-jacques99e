import { test, expect } from "@playwright/test";
import { loginToApp, dismissOnboarding } from "./helpers/auth.mjs";

const APP_URL = process.env.E2E_APP_URL || "https://wazo-digital.vercel.app";

const OWNER = {
  email: process.env.E2E_OWNER_EMAIL || "test.owner@wazo.africa",
  password: process.env.E2E_OWNER_PASSWORD || "TestOwner2026!",
};

async function selectLanguage(page: import("@playwright/test").Page, code: string) {
  await page.locator("main select").selectOption(code);
}

test.describe("Changement de langue — app Wazo Digital", () => {
  test("profil et modules se traduisent (FR → EN → SW → WO)", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await loginToApp(page, { ...OWNER, appUrl: APP_URL });
    await dismissOnboarding(page);
    await page.goto(`${APP_URL}/profile`);
    await expect(page.getByRole("heading", { name: "Profil" })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Langue", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /Mes modules/i })).toBeVisible();

    await selectLanguage(page, "en");
    await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
    await expect(page.getByText("Language", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /My modules/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();
    await expect
      .poll(async () => page.evaluate(() => localStorage.getItem("wazo_language")))
      .toBe("en");

    await page.getByRole("link", { name: /My modules/i }).click();
    await page.waitForURL(/\/modules/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: "My modules" })).toBeVisible();
    await expect(
      page.getByText("Enable sectors suited to your business")
    ).toBeVisible();

    await page.goto(`${APP_URL}/profile`);
    await selectLanguage(page, "sw");
    await expect(page.getByText("Lugha", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /Moduli zangu/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Toka" })).toBeVisible();

    await page.getByRole("link", { name: /Moduli zangu/i }).click();
    await expect(page.getByRole("heading", { name: "Moduli zangu" })).toBeVisible();
    await expect(page.getByText("Washa sekta zinazofaa biashara yako")).toBeVisible();

    await page.goto(`${APP_URL}/profile`);
    await selectLanguage(page, "wo");
    await expect(page.getByText("Làkk", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /Sama modules/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Génn" })).toBeVisible();
    await expect
      .poll(async () => page.evaluate(() => localStorage.getItem("wazo_language")))
      .toBe("wo");

    await selectLanguage(page, "fr");
    await expect(page.getByText("Langue", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /Mes modules/i })).toBeVisible();

    await context.close();
  });
});
