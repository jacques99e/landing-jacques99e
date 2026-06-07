"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { AppPhoneMockup } from "@/components/vitrine/AppPhoneMockup";
import { APP_STATS } from "@/lib/vitrine-data";
import { resolveAppUrl } from "@/lib/public-urls";

export function HeroSection() {
  const appUrl = resolveAppUrl();

  return (
    <section id="application" className="scroll-mt-32 grid items-center gap-12 py-12 md:grid-cols-2 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-[#075E54]/10 px-4 py-1.5 text-sm font-medium text-[#075E54]">
          📱 Application Wazo Digital
        </span>
        <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-5xl">
          Votre activité, dans une app pensée pour l&apos;Afrique
        </h1>
        <p className="text-base leading-relaxed text-[#1A1A1A]/75 md:text-lg">
          Caisse, stock, boutique WhatsApp, formation, livraisons et traçabilité — tout depuis
          votre téléphone. Inscrivez-vous ici, gérez au quotidien dans l&apos;application.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF6F00] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105"
          >
            Créer mon compte gratuit
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={`${appUrl}/login`}
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#075E54] bg-white px-6 py-3 text-sm font-semibold text-[#075E54] transition hover:bg-[#075E54]/5"
          >
            <Play className="h-4 w-4" />
            Ouvrir l&apos;application
          </a>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
          {APP_STATS.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white px-3 py-2 text-center shadow-sm">
              <p className="text-lg font-bold text-[#075E54]">{stat.value}</p>
              <p className="text-[10px] text-[#1A1A1A]/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <AppPhoneMockup />
    </section>
  );
}
