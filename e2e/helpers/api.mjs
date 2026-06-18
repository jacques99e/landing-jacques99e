import { createClient } from "@supabase/supabase-js";
import { fetchSession, loadEnv } from "./auth.mjs";
import { resolveAppUrl, resolveLandingUrl } from "../urls.mjs";

const APP = resolveAppUrl();
const LANDING = resolveLandingUrl();

const OWNER = {
  email: process.env.E2E_OWNER_EMAIL || "test.owner@wazo.africa",
  password: process.env.E2E_OWNER_PASSWORD || "TestOwner2026!",
};

const TEST_STORE_SLUG =
  process.env.E2E_STORE_SLUG || "boutique-test-roles-wazo";

let cachedStoreId = process.env.E2E_STORE_ID || null;

export async function getTestStoreId() {
  if (cachedStoreId) return cachedStoreId;

  const env = loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Variables Supabase manquantes pour résoudre la boutique test.");
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await admin
    .from("stores")
    .select("id")
    .eq("slug", TEST_STORE_SLUG)
    .maybeSingle();

  if (error || !data?.id) {
    throw new Error(
      `Boutique test « ${TEST_STORE_SLUG} » introuvable. Lancez npm run setup:test-accounts dans wazo-digital.`
    );
  }

  cachedStoreId = data.id;
  return cachedStoreId;
}

export async function apiCall(token, path, init = {}) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(init.headers || {}),
  };
  const res = await fetch(`${APP}${path}`, { ...init, headers });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body, ok: res.ok };
}

export async function getOwnerToken() {
  const session = await fetchSession(OWNER.email, OWNER.password);
  return session.access_token;
}

export { APP, LANDING, OWNER, TEST_STORE_SLUG };
