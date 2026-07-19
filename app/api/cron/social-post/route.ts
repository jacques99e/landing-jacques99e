import { NextResponse } from "next/server";
import { publishSocialPost } from "@/lib/meta-publish";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";
  const auth = request.headers.get("authorization");
  const url = new URL(request.url);
  const q = url.searchParams.get("secret");
  return auth === `Bearer ${secret}` || q === secret;
}

export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const dryRun = url.searchParams.get("dryRun") === "1";

  try {
    const result = await publishSocialPost({ key, dryRun });
    return NextResponse.json({
      ok: result.ok,
      key: result.post.key,
      skipped: result.skipped ?? null,
      facebook: result.facebook ?? null,
      instagram: result.instagram ?? null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "publish failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
