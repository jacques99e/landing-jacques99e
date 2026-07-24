import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Proxy OAuth Meta → app.
 * Meta n'accepte que le domaine racine wazo-digital.com ;
 * l'échange de code se fait ensuite côté app avec la même redirect_uri.
 */
export async function GET(request: NextRequest) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ||
    "https://app.wazo-digital.com";

  const target = new URL(`${appUrl}/api/social/meta/callback`);
  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  return NextResponse.redirect(target.toString());
}
