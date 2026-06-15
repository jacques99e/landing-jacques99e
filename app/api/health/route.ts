import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Endpoint public de monitoring (pas de secrets exposés). */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "wazo-landing",
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    supabase: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
    appUrl: process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? null,
  });
}
