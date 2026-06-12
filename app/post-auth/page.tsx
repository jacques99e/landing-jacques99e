"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";
import { isPaidVitrinePlan } from "../../lib/plan-checkout";
import { resolveAppUrl } from "../../lib/public-urls";

export default function PostAuthPage() {
  const [status, setStatus] = useState("Verification de la session...");
  const [detail, setDetail] = useState<string | null>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    let done = false;

    const go = (href: string) => {
      if (done) return;
      done = true;
      window.location.href = href;
    };

    const run = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setDetail(`Erreur getSession: ${error.message}`);
          go("/login");
          return;
        }

        const session = data.session;
        if (!session) {
          setStatus("Aucune session active. Redirection vers la connexion...");
          go("/login");
          return;
        }

        const appUrl = resolveAppUrl();

        const handoffUrl = new URL("/auth/receive", appUrl);
        const pendingModule = sessionStorage.getItem("wazo_pending_module");
        if (pendingModule) {
          handoffUrl.searchParams.set("module", pendingModule);
        }
        const pendingPlan = sessionStorage.getItem("wazo_pending_plan");
        if (pendingPlan) {
          handoffUrl.searchParams.set("plan", pendingPlan);
        }
        if (pendingPlan && isPaidVitrinePlan(pendingPlan)) {
          handoffUrl.searchParams.set("pay", "1");
        }
        handoffUrl.hash = new URLSearchParams({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        }).toString();

        go(handoffUrl.toString());
      } catch (err) {
        setDetail(err instanceof Error ? err.message : "Erreur inconnue");
        go("/login");
      }
    };

    void run();

    const safety = setTimeout(() => {
      setStuck(true);
    }, 5000);

    return () => clearTimeout(safety);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF8F0] px-4">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center text-[#075E54]">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm font-medium">{status}</p>
        {detail && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {detail}
          </p>
        )}
        {stuck && (
          <div className="mt-2 flex flex-col items-center gap-2">
            <p className="text-xs text-[#1A1A1A]/60">
              La redirection prend trop de temps.
            </p>
            <Link
              href="/login"
              className="rounded-full bg-[#FF6F00] px-5 py-2 text-xs font-semibold text-white"
            >
              Aller a la connexion
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
