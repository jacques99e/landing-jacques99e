const UTM_KEY = "wazo_utm";

export type UtmCapture = {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
};

export function readUtmFromSearch(search: URLSearchParams): UtmCapture {
  return {
    source: (search.get("utm_source") || "").trim().slice(0, 80),
    medium: (search.get("utm_medium") || "").trim().slice(0, 80),
    campaign: (search.get("utm_campaign") || "").trim().slice(0, 80),
    content: (search.get("utm_content") || "").trim().slice(0, 80),
    term: (search.get("utm_term") || "").trim().slice(0, 80),
  };
}

export function persistUtm(search: URLSearchParams) {
  if (typeof window === "undefined") return;
  const next = readUtmFromSearch(search);
  if (!next.source && !next.campaign) return;
  sessionStorage.setItem(UTM_KEY, JSON.stringify(next));
}

export function loadPersistedUtm(): UtmCapture | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(UTM_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UtmCapture;
  } catch {
    return null;
  }
}

export function formatUtm(utm: UtmCapture | null): string {
  if (!utm) return "";
  return [utm.source, utm.medium, utm.campaign].filter(Boolean).join(" / ");
}
