"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { AppPhoneMockup } from "@/components/vitrine/AppPhoneMockup";
import { APP_STATS, HERO } from "@/lib/vitrine-data";

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="application"
      className="hero-mesh scroll-mt-32 relative overflow-hidden rounded-3xl border border-[#075E54]/10 bg-white/60 px-4 py-12 backdrop-blur-sm md:px-10 md:py-16"
    >
      <div className="grid items-center gap-12 md:grid-cols-2">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.55 }}
          className="relative z-10 space-y-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#FF6F00]/20 bg-[#FF6F00]/10 px-4 py-1.5 text-sm font-semibold text-[#FF6F00]">
            <Sparkles className="h-4 w-4" />
            {HERO.badge}
          </span>

          <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight md:text-5xl lg:text-[3.25rem]">
            {HERO.title}{" "}
            <span className="bg-gradient-to-r from-[#075E54] to-[#0a9a8a] bg-clip-text text-transparent">
              {HERO.titleAccent}
            </span>
          </h1>

          <p className="text-base leading-relaxed text-[#1A1A1A]/75 md:text-lg">{HERO.subtitle}</p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/register?plan=pro"
              className="cta-pulse inline-flex items-center justify-center gap-2 rounded-full bg-[#FF6F00] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#FF6F00]/25 transition hover:brightness-110"
            >
              {HERO.ctaPrimary}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#modules"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#075E54]/30 bg-white px-6 py-3 text-sm font-semibold text-[#075E54] transition hover:border-[#075E54] hover:bg-[#075E54]/5"
            >
              {HERO.ctaSecondary}
            </a>
          </div>
          <p className="text-sm text-[#1A1A1A]/65">
            Commerçant pilote ?{" "}
            <Link href="/guide-pilote" className="font-semibold text-[#075E54] underline underline-offset-2">
              Guide de démarrage (PDF & WhatsApp)
            </Link>
          </p>

          <p className="text-xs text-[#1A1A1A]/55 md:text-sm">{HERO.reassurance}</p>

          <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-4">
            {APP_STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduceMotion ? { duration: 0 } : { delay: 0.3 + i * 0.08 }}
                className="rounded-xl border border-[#075E54]/10 bg-white px-3 py-2.5 text-center shadow-sm"
              >
                <p className="text-lg font-bold text-[#075E54]">{stat.value}</p>
                <p className="text-[10px] font-medium text-[#1A1A1A]/55">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="relative z-10 flex justify-center md:justify-end">
          <div className="animate-float-soft">
            <AppPhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
