/**
 * fetch avec retries (réseau instable / cold start Vercel).
 */
export async function fetchWithRetry(url, options = {}, attempts = 3) {
  const timeoutMs = options.timeoutMs ?? 25_000;
  let lastError;

  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (e) {
      clearTimeout(timer);
      lastError = e;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw lastError;
}
