"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Crown, Sparkles } from "lucide-react";
import { MomoFlowDemo } from "@/components/vitrine/MomoFlowDemo";
import { MOMO_FLOW_STEPS, WAZO_PREMIUM_HIGHLIGHTS } from "@/lib/vitrine-data";

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

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8 rounded-3xl border border-orange-200 bg-orange-50/80 p-6 md:p-8"
      >
        <h3 className="text-lg font-bold text-orange-950">MoMo PayDunya LIVE — en 3 étapes</h3>
        <p className="mt-1 text-sm text-orange-900/80">
          Encaissez à distance comme les grandes plateformes — adapté aux commerçants africains.
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2 lg:items-center">
          <ol className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {MOMO_FLOW_STEPS.map((s) => (
              <li key={s.step} className="rounded-2xl bg-white p-4 text-sm shadow-sm">
                <span className="text-xs font-bold text-orange-600">Étape {s.step}</span>
                <p className="mt-1 font-semibold text-[#1A1A1A]">{s.title}</p>
                <p className="mt-1 text-xs text-gray-600">{s.detail}</p>
              </li>
            ))}
          </ol>
          <MomoFlowDemo />
        </div>
        <Link
          href="/register"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#075E54] underline"
        >
          Tester avec un compte gratuit
          <ArrowRight className="h-4 w-4" />
        </Link>
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
