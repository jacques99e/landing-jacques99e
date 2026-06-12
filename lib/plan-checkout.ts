/** Aligné sur wazo-digital `wazo_pending_plan_pay` */
export const PENDING_PLAN_PAY_KEY = "wazo_pending_plan_pay";

export function isPaidVitrinePlan(planId: string | null | undefined): boolean {
  const id = planId?.toLowerCase();
  return id === "pro" || id === "business";
}

/** Marque le plan pour redirection paiement après connexion (PRO / BUSINESS). */
export function markPlanForCheckout(planId: string) {
  if (typeof window === "undefined") return;
  if (isPaidVitrinePlan(planId)) {
    sessionStorage.setItem(PENDING_PLAN_PAY_KEY, "1");
  } else {
    sessionStorage.removeItem(PENDING_PLAN_PAY_KEY);
  }
}
