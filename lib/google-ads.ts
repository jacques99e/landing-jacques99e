declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackGoogleAdsConversion() {
  if (typeof window === "undefined" || !window.gtag) return;
  const id = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim();
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?.trim();
  if (!id || !label) return;
  window.gtag("event", "conversion", { send_to: `${id}/${label}` });
}
