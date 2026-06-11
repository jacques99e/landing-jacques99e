"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { STICKY_CTA } from "@/lib/vitrine-data";

export function StickyCtaBar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (dismissed) return;
      setVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  if (!visible || dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#075E54]/15 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(7,94,84,0.12)] backdrop-blur-md md:py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-2 md:px-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[#075E54] md:text-base">{STICKY_CTA.title}</p>
          <p className="hidden text-xs text-[#1A1A1A]/60 sm:block">{STICKY_CTA.subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/register?plan=pro"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6F00] px-4 py-2.5 text-xs font-semibold text-white sm:px-5 sm:text-sm"
          >
            {STICKY_CTA.button}
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-full p-2 text-[#1A1A1A]/40 hover:bg-[#075E54]/5 hover:text-[#1A1A1A]"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
