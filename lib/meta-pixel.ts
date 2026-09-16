declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackMetaEvent(
  event: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined" || !window.fbq) return;
  if (params) {
    window.fbq("track", event, params);
  } else {
    window.fbq("track", event);
  }
}

export function trackMetaLead(source?: string) {
  trackMetaEvent("Lead", {
    content_name: "register",
    content_category: source ?? "landing",
  });
}

export function trackMetaCompleteRegistration(method?: string) {
  trackMetaEvent("CompleteRegistration", {
    content_name: "wazo_register",
    status: method ?? "email",
  });
}

export function trackMetaStartTrial(plan = "pro") {
  trackMetaEvent("StartTrial", {
    content_name: plan,
    content_category: "subscription",
    currency: "EUR",
    value: plan === "business" ? 24.99 : 9.99,
    predicted_ltv: plan === "business" ? 24.99 : 9.99,
  });
}

export function trackMetaFirstProduct(name?: string) {
  trackMetaEvent("AddToCart", {
    content_name: name?.slice(0, 80) || "first_product",
    content_type: "product",
  });
}

export function trackMetaMomoCheckout(value?: number) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("trackCustom", "BoutiqueMoMoCheckout", {
    content_name: "boutique_momo",
    currency: "XOF",
    value: Number.isFinite(value) ? Number(value) : 0,
  });
}

export function trackMetaPurchase(value: number, contentName = "pro") {
  const isSub = contentName === "pro" || contentName === "business";
  trackMetaEvent("Purchase", {
    content_name: contentName,
    content_category: isSub ? "subscription" : "other",
    currency: isSub ? "EUR" : "XOF",
    value: isSub
      ? contentName === "business"
        ? 24.99
        : 9.99
      : Number.isFinite(value)
        ? Number(value)
        : 0,
  });
}
