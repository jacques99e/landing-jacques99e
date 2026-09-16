import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { buildAppHandoffUrl, resolveAppUrlServer } from "../../../lib/public-urls";

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

      // Google / email : cookies landing → plan + UTM sur l’app (sessionStorage ne survit pas au serveur).
      return NextResponse.redirect(
        buildAppHandoffUrl(
          data.session.access_token,
          data.session.refresh_token,
          resolveAppUrlServer(),
          {
            plan: request.cookies.get("wazo_pending_plan")?.value,
            module: request.cookies.get("wazo_pending_module")?.value,
            utmJson: request.cookies.get("wazo_utm")?.value,
          }
        )
      );
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
