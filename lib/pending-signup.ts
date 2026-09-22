/** Plan / module / UTM : sessionStorage + cookie (Google OAuth lit le cookie côté serveur). */

import { loadPersistedUtm, persistUtm, type UtmCapture } from "./utm";

const DAY = 60 * 60 * 24;

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${DAY}; SameSite=Lax`;
}

export function persistPendingPlan(planId: string | null | undefined) {
  if (typeof window === "undefined") return;
  const plan = String(planId || "").toLowerCase();
  if (!["free", "pro", "business"].includes(plan)) return;
  sessionStorage.setItem("wazo_pending_plan", plan);
  writeCookie("wazo_pending_plan", plan);
}

export function persistPendingModule(moduleId: string | null | undefined) {
  if (typeof window === "undefined") return;
  const id = String(moduleId || "").trim();
  if (!id) return;
  sessionStorage.setItem("wazo_pending_module", id);
  writeCookie("wazo_pending_module", id);
}

export function persistUtmCookie(utm: UtmCapture | null) {
  if (!utm || (!utm.source && !utm.campaign)) return;
  writeCookie("wazo_utm", JSON.stringify(utm));
}

/** Pub Facebook / paid : pas de ?plan= dans l’URL actuelle, on force l’essai PRO. */
export function inferSignupPlan(search: URLSearchParams): string | null {
  const explicit = String(search.get("plan") || "").toLowerCase();
  if (["free", "pro", "business"].includes(explicit)) return explicit;

  const persisted = loadPersistedUtm();
  const source = (search.get("utm_source") || persisted?.source || "").toLowerCase();
  const medium = (search.get("utm_medium") || persisted?.medium || "").toLowerCase();
  const campaign = (search.get("utm_campaign") || persisted?.campaign || "").toLowerCase();
  if (
    source === "facebook" ||
    source === "instagram" ||
    medium === "paid" ||
    campaign.includes("pro") ||
    campaign.includes("essai") ||
    campaign.includes("action")
  ) {
    return "pro";
  }
  return null;
}

/** Appelé sur /register et /login : garde le plan pub même après le détour Google. */
export function persistSignupIntent(search: URLSearchParams) {
  persistUtm(search);
  persistPendingPlan(search.get("plan") || inferSignupPlan(search));
  persistPendingModule(search.get("module"));
  persistUtmCookie(loadPersistedUtm());
}
