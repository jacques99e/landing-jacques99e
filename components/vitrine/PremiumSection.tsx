"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Crown, Sparkles } from "lucide-react";
import { WAZO_PREMIUM_HIGHLIGHTS } from "@/lib/vitrine-data";

export function PremiumSection() {
  return (
    <section id="premium" className="scroll-mt-32 py-16">
      <div className="mb-10 text-center">
        <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-600">
          <Crown className="h-4 w-4" />
          Wazo Premium
        </p>
        <h2 className="mt-2 text-2xl font-bold md:text-4xl">
          L&apos;arsenal qui n&apos;existe nulle part ailleurs
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-[#1A1A1A]/70">
          Pensé pour l&apos;Afrique : voix, tontine, veille sanitaire, flotte, badges et passeport
          export — le score Nexus relie tout votre business.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8 rounded-3xl bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-6 text-white shadow-xl md:p-8"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <Sparkles className="h-4 w-4" />
              Wazo Nexus
            </p>
            <h3 className="mt-1 text-xl font-bold">Score continental 0–100</h3>
            <p className="mt-2 max-w-lg text-sm text-white/75">
              Un tableau de bord unique qui agrège ventes, agriculture, santé, logistique et
              formation — avec actions prioritaires en un clic.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-[#1a1a2e] transition hover:bg-amber-400"
          >
            Démarrer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {WAZO_PREMIUM_HIGHLIGHTS.map((item, i) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl border border-amber-200/60 bg-white p-4 text-sm shadow-sm"
          >
            <span className="mb-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
              Exclusif
            </span>
            <p className="font-medium text-[#1A1A1A]">{item}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
