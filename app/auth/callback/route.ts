import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { buildAppHandoffUrl } from "../../../lib/public-urls";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/post-auth";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      if (next === "/reset-password") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      // OAuth / email : envoi direct vers l'app (sans page post-auth intermédiaire)
      return NextResponse.redirect(
        buildAppHandoffUrl(data.session.access_token, data.session.refresh_token)
      );
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
