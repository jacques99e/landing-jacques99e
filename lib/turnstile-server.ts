import { clientIp } from "./client-ip";

export async function verifyTurnstile(
  request: Request,
  token: string | null | undefined
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const prod =
    process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";

  if (!secret) {
    if (siteKey && prod) return false;
    return true;
  }
  if (!token) return false;

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret,
      response: token,
      remoteip: clientIp(request),
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean };
  return data.success === true;
}
