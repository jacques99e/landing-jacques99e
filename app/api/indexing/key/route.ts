import { NextResponse } from "next/server";
import { indexNowKeyLocation, resolveIndexNowKey, resolveSiteUrl } from "@/lib/indexing";

export async function GET() {
  const siteUrl = resolveSiteUrl();
  const host = new URL(siteUrl).host;
  const key = resolveIndexNowKey(host);
  if (!key) {
    return new NextResponse("IndexNow non configure", { status: 404 });
  }

  return new NextResponse(key, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-IndexNow-Key-Location": indexNowKeyLocation(siteUrl),
    },
  });
}
