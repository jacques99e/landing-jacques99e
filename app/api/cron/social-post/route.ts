import { NextResponse } from "next/server";
import { getSocialPost, pickPostForDate } from "@/lib/social-posts";
import { publishSocialPost } from "@/lib/meta-publish";

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/**
 * Auto-post Facebook Page (+ Instagram si configuré).
 * Cron Vercel : lun/mer/ven 10:00 UTC
 * Manuel : GET /api/cron/social-post?key=register&dryRun=1
 */
export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (process.env.SOCIAL_POST_ENABLED?.trim() !== "1") {
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: "SOCIAL_POST_ENABLED n'est pas à 1",
    });
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const dryRun =
    searchParams.get("dryRun") === "1" || searchParams.get("dry_run") === "1";

  const post = key ? getSocialPost(key) : pickPostForDate();
  const published = await publishSocialPost({
    message: post.message,
    link: post.link,
    dryRun,
  });

  if (!published.configured) {
    return NextResponse.json(
      {
        success: false,
        error: "META_PAGE_ID / META_PAGE_ACCESS_TOKEN manquants",
        post: post.key,
      },
      { status: 503 }
    );
  }

  const hardFail = published.results.some((r) => !r.ok && !r.skipped);

  return NextResponse.json({
    success: !hardFail,
    dryRun: published.dryRun,
    post: post.key,
    results: published.results,
  });
}
