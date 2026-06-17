"use client";

import Link from "next/link";
import { Download, MessageCircle, Printer } from "lucide-react";
import { SiteHeader } from "@/components/vitrine/SiteHeader";
import { SiteFooter } from "@/components/vitrine/SiteFooter";
import {
  buildPilotGuideWhatsAppMessage,
  downloadPilotGuideText,
  PILOT_GUIDE_SECTIONS,
  PILOT_GUIDE_TITLE,
} from "@/lib/pilot-guide";
import { WHATSAPP_SUPPORT } from "@/lib/vitrine-data";

const WHATSAPP_URL = `https://wa.me/${WHATSAPP_SUPPORT.replace(/\D/g, "")}?text=${encodeURIComponent(buildPilotGuideWhatsAppMessage())}`;

export default function GuidePilotePage() {
  return (
    <div className="min-h-screen bg-[#FFF8F0] font-[system-ui,sans-serif] text-[#1A1A1A]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-28 md:px-6 print:py-8">
        <div className="mb-8 flex flex-wrap gap-3 print:hidden">
          <Link
            href="/register"
            className="rounded-full bg-[#FF6F00] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Créer mon compte
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full border border-[#075E54]/30 bg-white px-4 py-2 text-sm font-medium text-[#075E54]"
          >
            <Printer className="h-4 w-4" />
            Enregistrer en PDF
          </button>
          <button
            type="button"
            onClick={downloadPilotGuideText}
            className="inline-flex items-center gap-2 rounded-full border border-[#075E54]/30 bg-white px-4 py-2 text-sm font-medium text-[#075E54]"
          >
            <Download className="h-4 w-4" />
            Télécharger (.txt)
          </button>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white"
          >
            <MessageCircle className="h-4 w-4" />
            Partager sur WhatsApp
          </a>
        </div>

        <article className="rounded-2xl border border-[#075E54]/10 bg-white p-6 shadow-sm md:p-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#FF6F00]">
            Programme pilote
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#075E54] md:text-3xl">{PILOT_GUIDE_TITLE}</h1>
          <p className="mt-3 text-sm text-[#1A1A1A]/70">
            Ce guide est fait pour les premiers commerçants qui testent Wazo Digital. Suivez les
            étapes dans l&apos;ordre — compte, produits, caisse, WhatsApp — en moins de 30 minutes.
          </p>

          <ol className="mt-8 space-y-8">
            {PILOT_GUIDE_SECTIONS.map((section) => (
              <li key={section.title}>
                <h2 className="text-lg font-semibold text-[#075E54]">{section.title}</h2>
                <ul className="mt-3 space-y-2 text-sm text-[#1A1A1A]/80">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="text-[#FF6F00]">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <p className="mt-10 border-t border-[#075E54]/10 pt-6 text-center text-xs text-[#1A1A1A]/50">
            wazo-digital.com · app.wazo-digital.com
          </p>
        </article>
      </main>
      <div className="print:hidden">
        <SiteFooter />
      </div>
    </div>
  );
}
