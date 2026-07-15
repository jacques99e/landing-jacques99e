import fs from "fs";
import path from "path";

const WAZO_ENV = path.join(process.cwd(), "..", "wazo-digital", ".env.local");
const LOCAL_ENV = path.join(process.cwd(), ".env.local");

export function loadEnv() {
  const out = {};
  for (const file of [LOCAL_ENV, WAZO_ENV]) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
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
  }
  return out;
}

async function fetchSessionViaAdminMagicLink(email, env) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service =
    process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !service) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY requis (CAPTCHA Auth actif)");
  }

  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(supabaseUrl, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkError || !linkData?.properties?.hashed_token) {
    throw new Error(linkError?.message || "generateLink magiclink échoué");
  }

  const anon = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await anon.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: "email",
  });
  if (error || !data?.session) {
    throw new Error(error?.message || "verifyOtp session échoué");
  }
  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  };
}

export async function fetchSession(email, password) {
  const env = loadEnv();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    throw new Error("Variables Supabase manquantes pour E2E");
  }

  const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json().catch(() => ({}));
  if (res.ok) return json;

  const msg = String(json.msg || json.error_description || json.error || `Auth ${res.status}`);
  // CAPTCHA Auth actif → session via service role (scripts/CI uniquement)
  if (/captcha/i.test(msg)) {
    return fetchSessionViaAdminMagicLink(email, env);
  }
  throw new Error(msg);
}

export function buildAppHandoffUrl(appUrl, accessToken, refreshToken) {
  const hash = new URLSearchParams({
    access_token: accessToken,
    refresh_token: refreshToken,
  }).toString();
  return `${appUrl.replace(/\/$/, "")}/auth/receive#${hash}`;
}

export async function loginToApp(page, { email, password, appUrl }) {
  const session = await fetchSession(email, password);
  await page.goto(buildAppHandoffUrl(appUrl, session.access_token, session.refresh_token));
  await page.waitForURL(/dashboard|setup/, { timeout: 60_000 });
  const skip = page.getByRole("button", { name: /Passer pour l'instant/i });
  if (await skip.isVisible({ timeout: 3000 }).catch(() => false)) {
    await skip.click();
  }
}

export async function dismissOnboarding(page) {
  const skip = page.getByRole("button", { name: /Passer pour l'instant/i });
  if (await skip.isVisible({ timeout: 5000 }).catch(() => false)) {
    await skip.click();
  }
}
