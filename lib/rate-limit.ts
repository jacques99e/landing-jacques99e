import { clientIp } from "./client-ip";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function allowRequest(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 4000) {
      for (const [k, v] of buckets) {
        if (now > v.resetAt) buckets.delete(k);
      }
    }
    return true;
  }
  if (bucket.count >= max) return false;
  bucket.count += 1;
  return true;
}

export function allowIp(request: Request, scope: string, max: number, windowMs: number): boolean {
  return allowRequest(`${scope}:${clientIp(request)}`, max, windowMs);
}
