import { PROD_APP_URL, PROD_LANDING_URL } from "./site-urls";
const DEV_LANDING_URL = "http://localhost:3000";
const DEV_APP_URL = "http://localhost:3001";

function isLocalhostHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function isLocalhostUrl(url: string): boolean {
  try {
    return isLocalhostHostname(new URL(url).hostname);
  } catch {
    return true;
  }
}

function isBrowserOnLocalhost(): boolean {
  if (typeof window === "undefined") return false;
  return isLocalhostHostname(window.location.hostname);
}

function isProductionBrowser(): boolean {
  if (typeof window === "undefined") return false;
  return !isBrowserOnLocalhost();
}

export function resolveLandingUrl(): string {
  if (isProductionBrowser()) return PROD_LANDING_URL;

  const envUrl = process.env.NEXT_PUBLIC_LANDING_URL?.trim().replace(/\/$/, "");
  if (isBrowserOnLocalhost()) {
    return envUrl && !isLocalhostUrl(envUrl) ? envUrl : DEV_LANDING_URL;
  }
  if (envUrl && !isLocalhostUrl(envUrl)) return envUrl;
  return PROD_LANDING_URL;
}

/** URL de callback OAuth / email — toujours la landing prod hors localhost. */
export function getAuthCallbackUrl(nextPath = "/post-auth"): string {
  const base = `${resolveLandingUrl()}/auth/callback`;
  if (nextPath && nextPath !== "/post-auth") {
    return `${base}?next=${encodeURIComponent(nextPath)}`;
  }
  return base;
}

export function resolveAppUrl(): string {
  if (isProductionBrowser()) return PROD_APP_URL;

  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (isBrowserOnLocalhost()) {
    return envUrl && !isLocalhostUrl(envUrl) ? envUrl : DEV_APP_URL;
  }
  if (envUrl && !isLocalhostUrl(envUrl)) return envUrl;
  return PROD_APP_URL;
}

/** Côté serveur (callback OAuth) — jamais localhost en prod Vercel. */
export function resolveAppUrlServer(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (envUrl && !isLocalhostUrl(envUrl)) return envUrl;
  return PROD_APP_URL;
}

export function buildAppHandoffUrl(
  accessToken: string,
  refreshToken: string,
  appBase = resolveAppUrlServer(),
  extras?: {
    plan?: string | null;
    module?: string | null;
    utmJson?: string | null;
  }
): string {
  const handoff = new URL("/auth/receive", appBase);
  const plan = extras?.plan?.trim();
  if (plan) handoff.searchParams.set("plan", plan);
  const moduleId = extras?.module?.trim();
  if (moduleId) handoff.searchParams.set("module", moduleId);
  if (extras?.utmJson) {
    try {
      const utm = JSON.parse(extras.utmJson) as {
        source?: string;
        medium?: string;
        campaign?: string;
      };
      if (utm.source) handoff.searchParams.set("utm_source", utm.source);
      if (utm.medium) handoff.searchParams.set("utm_medium", utm.medium);
      if (utm.campaign) handoff.searchParams.set("utm_campaign", utm.campaign);
    } catch {
      /* cookie UTM illisible : on continue sans */
    }
  }
  handoff.hash = new URLSearchParams({
    access_token: accessToken,
    refresh_token: refreshToken,
  }).toString();
  return handoff.toString();
}
