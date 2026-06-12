const PROD_LANDING = "https://landing-jacques99e.vercel.app";
const PROD_APP = "https://wazo-digital.vercel.app";

const LOCAL_HOST = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i;

function normalize(url) {
  return url.replace(/\/$/, "");
}

/**
 * Résout l'URL landing pour les E2E.
 * Par défaut : prod Vercel. localhost n'est utilisé que si E2E_USE_LOCAL=1.
 */
export function resolveLandingUrl() {
  const explicit = process.env.E2E_LANDING_URL?.trim();
  const useLocal = process.env.E2E_USE_LOCAL === "1";

  if (!explicit) return PROD_LANDING;
  if (!useLocal && LOCAL_HOST.test(explicit)) {
    console.warn(
      `[e2e] E2E_LANDING_URL=${explicit} ignoré — prod par défaut. ` +
        "Définissez E2E_USE_LOCAL=1 pour tester en local."
    );
    return PROD_LANDING;
  }
  return normalize(explicit);
}

/**
 * Résout l'URL app pour les E2E (même règle que resolveLandingUrl).
 */
export function resolveAppUrl() {
  const explicit = process.env.E2E_APP_URL?.trim();
  const useLocal = process.env.E2E_USE_LOCAL === "1";

  if (!explicit) return PROD_APP;
  if (!useLocal && LOCAL_HOST.test(explicit)) {
    console.warn(
      `[e2e] E2E_APP_URL=${explicit} ignoré — prod par défaut. ` +
        "Définissez E2E_USE_LOCAL=1 pour tester en local."
    );
    return PROD_APP;
  }
  return normalize(explicit);
}

export { PROD_LANDING, PROD_APP };
