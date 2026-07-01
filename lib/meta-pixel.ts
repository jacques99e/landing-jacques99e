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
