"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Check } from "lucide-react";
import { DEMO_CHAPTERS, DEMO_VIDEO } from "@/lib/vitrine-data";

const DEMO_HIGHLIGHTS = [
  "Caisse MoMo en direct",
  "Page abonnement PRO",
  "Voix off en français",
] as const;

export function DemoVideoSection() {
  const [videoError, setVideoError] = useState(false);

  return (
    <section id="demo" className="scroll-mt-32 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#FF6F00]/15 px-4 py-1.5 text-sm font-bold text-[#FF6F00]">
          <Sparkles className="h-4 w-4" />
          Démo {DEMO_VIDEO.durationLabel} · application réelle
        </span>
        <h2 className="mt-4 text-2xl font-extrabold md:text-4xl">
          Voyez l&apos;app — puis passez au{" "}
          <span className="text-[#075E54]">PRO</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-[#1A1A1A]/70 md:text-base">
          {DEMO_VIDEO.subtitle}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto mt-6 max-w-4xl overflow-hidden rounded-2xl border-2 border-[#FF6F00]/25 bg-white shadow-xl shadow-[#075E54]/10"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#075E54]/10 bg-gradient-to-r from-[#075E54] to-[#0a7a6e] px-4 py-3 text-white">
          <p className="text-sm font-semibold">
            ▶ Tutoriel + page abonnement incluse
          </p>
          <Link
            href="/register?plan=pro"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6F00] px-4 py-1.5 text-xs font-bold shadow-md transition hover:brightness-110"
          >
            Choisir PRO — 9,99 €/mois
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="relative aspect-video w-full bg-[#0f1412]">
          {!videoError ? (
            <video
              className="h-full w-full object-contain"
              controls
              playsInline
              preload="metadata"
              title={DEMO_VIDEO.title}
              {...(DEMO_VIDEO.poster ? { poster: DEMO_VIDEO.poster } : {})}
              onError={() => setVideoError(true)}
            >
              <source src={DEMO_VIDEO.mp4Src} type="video/mp4" />
              <source src={DEMO_VIDEO.webmSrc} type="video/webm" />
            </video>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center text-white">
              <p className="text-sm text-white/80">Vidéo en cours de chargement.</p>
              <Link
                href="/register?plan=pro"
                className="inline-flex items-center gap-2 rounded-full bg-[#FF6F00] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Choisir PRO maintenant
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#075E54]/10 px-4 py-3 text-left text-xs text-[#1A1A1A]/60">
          {DEMO_HIGHLIGHTS.map((item) => (
            <span key={item} className="inline-flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-[#075E54]" />
              {item}
            </span>
          ))}
        </div>
      </motion.div>

      <div className="mx-auto mt-6 flex max-w-4xl flex-wrap justify-center gap-2">
        {DEMO_CHAPTERS.map((chapter) => (
          <span
            key={chapter.label}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs shadow-sm ${
              chapter.label.includes("PRO") || chapter.label.includes("Passer")
                ? "border-[#FF6F00]/40 bg-[#FF6F00]/10 font-semibold text-[#FF6F00]"
                : "border-[#075E54]/15 bg-white text-[#1A1A1A]/80"
            }`}
          >
            <span aria-hidden>{chapter.emoji}</span>
            {chapter.label}
          </span>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto mt-8 max-w-lg rounded-2xl border border-[#FF6F00]/30 bg-gradient-to-br from-[#FF6F00]/10 to-[#075E54]/5 p-6 text-center"
      >
        <p className="text-sm font-bold text-[#1A1A1A]">
          Après la vidéo, la prochaine étape est simple
        </p>
        <p className="mt-2 text-xs text-[#1A1A1A]/65">
          Gratuit pour tester · PRO à 9,99 €/mois sans engagement · même app que dans la démo
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/register?plan=pro"
            className="cta-pulse inline-flex items-center justify-center gap-2 rounded-full bg-[#FF6F00] px-6 py-3 text-sm font-bold text-white shadow-lg"
          >
            Je m&apos;abonne au PRO
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full border-2 border-[#075E54]/30 px-6 py-3 text-sm font-semibold text-[#075E54]"
          >
            Rester gratuit
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
