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

/** Appelé sur /register et /login : garde le plan pub même après le détour Google. */
export function persistSignupIntent(search: URLSearchParams) {
  persistUtm(search);
  persistPendingPlan(search.get("plan"));
  persistPendingModule(search.get("module"));
  persistUtmCookie(loadPersistedUtm());
}
