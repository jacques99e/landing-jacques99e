import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

/** Supabase renvoie parfois ?code= sur / (Site URL) au lieu de /auth/callback. */
function redirectOAuthCodeToCallback(request: NextRequest): NextResponse | null {
  const { pathname, searchParams } = request.nextUrl;
  if (pathname !== "/" || !searchParams.has("code")) {
    return null;
  }
  const url = request.nextUrl.clone();
  url.pathname = "/auth/callback";
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const oauthRedirect = redirectOAuthCodeToCallback(request);
  if (oauthRedirect) return oauthRedirect;

  const pathname = request.nextUrl.pathname;
  const method = request.method.toUpperCase();
  if (pathname.startsWith("/api") && method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    const origin = request.headers.get("origin")?.trim();
    const allowed = [
      "https://wazo-digital.com",
      "https://app.wazo-digital.com",
      process.env.NEXT_PUBLIC_LANDING_URL?.replace(/\/$/, ""),
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, ""),
    ].filter(Boolean) as string[];
    if (origin && !allowed.includes(origin) && !pathname.startsWith("/api/cron/") && !pathname.startsWith("/api/social/meta/callback")) {
      return NextResponse.json({ success: false, error: "Origine non autorisée." }, { status: 403 });
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
