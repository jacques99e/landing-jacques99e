"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/** Redirige vers l'application Wazo Digital après connexion sur la vitrine. */
export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/post-auth");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF8F0]">
      <div className="flex flex-col items-center gap-3 text-[#075E54]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm font-medium">Ouverture de l&apos;application...</p>
      </div>
    </main>
  );
}
