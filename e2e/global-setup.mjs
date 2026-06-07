import fs from "fs";
import path from "path";
import { chromium } from "@playwright/test";

const LANDING_URL = process.env.E2E_LANDING_URL || "https://landing-jacques99e.vercel.app";
const APP_URL = process.env.E2E_APP_URL || "https://wazo-digital.vercel.app";
const PASSWORD = process.env.E2E_TEST_PASSWORD || "WazoE2E2026!Modules";
const AUTH_DIR = path.join(process.cwd(), "e2e", ".auth");
const AUTH_FILE = path.join(AUTH_DIR, "user.json");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

async function signupViaApi(email, password) {
  const env = {
    ...loadEnvFile(path.join(process.cwd(), ".env.local")),
    ...loadEnvFile(path.join("C:", "Users", "user", "Desktop", "wazo-digital", ".env.local")),
  };
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return null;

  const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      data: { full_name: "E2E Test Modules" },
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.warn("[e2e-setup] signup API:", res.status, json.msg || json.error_description || "");
    return null;
  }
  return json;
}

async function loginOnLanding(page, email, password) {
  await page.goto(`${LANDING_URL}/login`);
  await page.getByPlaceholder("email@wazo.africa").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForTimeout(2500);
  const loginErr = page.locator("text=/Invalid login credentials|email not confirmed/i");
  if (await loginErr.isVisible().catch(() => false)) {
    throw new Error("Connexion impossible — vérifiez e-mail/mot de passe ou confirmez l'e-mail Supabase.");
  }
}

export default async function globalSetup() {
  const stamp = Date.now().toString(36);
  const userProvidedEmail = Boolean(process.env.E2E_TEST_EMAIL);
  const email = process.env.E2E_TEST_EMAIL || `e2e.modules.${stamp}@wazo.africa`;
  const password = process.env.E2E_TEST_PASSWORD || PASSWORD;
  process.env.E2E_TEST_EMAIL = email;
  process.env.E2E_TEST_PASSWORD = password;

  if (!userProvidedEmail) {
    await signupViaApi(email, password);
  }

  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    if (userProvidedEmail) {
      await loginOnLanding(page, email, password);
    } else {
      await page.goto(`${LANDING_URL}/register`);
      await page.getByPlaceholder("Fatou Diop").fill("E2E Test Modules");
      await page.getByPlaceholder("email@wazo.africa").fill(email);
      await page.getByPlaceholder("••••••••").fill(password);
      await page.getByRole("button", { name: "Creer mon compte gratuit" }).click();
      await page.waitForTimeout(3000);

      const confirmNeeded = page.locator("text=/Verifiez votre boite mail|confirmer/i");
      if (await confirmNeeded.isVisible().catch(() => false)) {
        throw new Error(
          "Inscription OK mais confirmation e-mail requise. Désactivez « Confirm email » dans Supabase Auth pour les tests E2E."
        );
      }

      if (!page.url().includes("/post-auth")) {
        await loginOnLanding(page, email, password);
      }
    }

    await page.waitForURL(/post-auth|auth\/receive|dashboard|setup/, { timeout: 60_000 });

    if (page.url().includes("/post-auth")) {
      await page.waitForURL(/auth\/receive|dashboard|setup/, { timeout: 60_000 });
    }
    if (page.url().includes("/auth/receive")) {
      await page.waitForURL(/dashboard|setup/, { timeout: 60_000 });
    }

    if (page.url().includes("/setup")) {
      const nameInput = page.getByPlaceholder(/Boutique Awa|Ex:/i);
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.fill(`E2E Tous Modules ${stamp}`);
        const toggles = page.getByRole("button", { name: "Activer le module" });
        for (let i = 0; i < (await toggles.count()); i++) {
          await toggles.nth(i).click();
        }
        await page.getByRole("button", { name: /Commencer/i }).click();
        await page.waitForURL(/dashboard/, { timeout: 45_000 });
      }
    }

    const skip = page.getByRole("button", { name: /Passer pour l'instant/i });
    if (await skip.isVisible({ timeout: 3000 }).catch(() => false)) {
      await skip.click();
    }

    await context.storageState({ path: AUTH_FILE });
    console.log("[e2e-setup] Session saved for", email);
  } catch (err) {
    console.warn("[e2e-setup] Auth setup failed:", err.message);
    fs.writeFileSync(
      path.join(AUTH_DIR, "setup-error.txt"),
      `${err.message}\nemail=${email}\nlanding=${LANDING_URL}\napp=${APP_URL}`
    );
  } finally {
    await browser.close();
  }
}
