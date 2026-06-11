"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, ArrowRight } from "lucide-react";
import { DEMO_CHAPTERS, DEMO_VIDEO } from "@/lib/vitrine-data";
import { resolveAppUrl } from "@/lib/public-urls";

export function DemoVideoSection() {
  const [videoError, setVideoError] = useState(false);
  const appUrl = resolveAppUrl();

  return (
    <section id="demo" className="scroll-mt-32 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#FF6F00]/10 px-4 py-1.5 text-sm font-medium text-[#FF6F00]">
          <Play className="h-4 w-4" />
          Tutoriel vidéo · {DEMO_VIDEO.durationLabel}
        </span>
        <h2 className="mt-4 text-2xl font-bold md:text-3xl">Comment utiliser Wazo Digital</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-[#1A1A1A]/70 md:text-base">
          {DEMO_VIDEO.subtitle}
        </p>
        <p className="mx-auto mt-2 max-w-lg text-xs font-medium text-[#075E54]">
          👇 Regardez 2 minutes — vous comprendrez pourquoi les commerçants passent au PRO.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-2xl border border-[#075E54]/15 bg-white shadow-lg shadow-[#075E54]/10"
      >
        <div className="relative aspect-video w-full bg-gradient-to-br from-[#075E54]/10 to-[#FF6F00]/5">
          {!videoError ? (
            <video
              className="h-full w-full bg-[#0f1412] object-contain"
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
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
              <p className="text-sm text-[#1A1A1A]/70">
                La vidéo est en cours de chargement sur ce déploiement.
              </p>
              <Link
                href={`${appUrl}/login`}
                className="inline-flex items-center gap-2 rounded-full bg-[#075E54] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Essayer l&apos;application
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-[#075E54]/10 px-4 py-3 text-left text-sm">
          <Play className="h-4 w-4 shrink-0 text-[#075E54]" />
          <span className="font-medium">{DEMO_VIDEO.title}</span>
          <span className="text-xs text-[#1A1A1A]/50">
            — voix off FR · {DEMO_VIDEO.durationLabel} · application réelle
          </span>
        </div>
      </motion.div>

      <div className="mx-auto mt-6 flex max-w-4xl flex-wrap justify-center gap-2">
        {DEMO_CHAPTERS.map((chapter) => (
          <span
            key={chapter.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#075E54]/15 bg-white px-3 py-1.5 text-xs text-[#1A1A1A]/80 shadow-sm"
          >
            <span aria-hidden>{chapter.emoji}</span>
            {chapter.label}
          </span>
        ))}
      </div>

      <p className="mx-auto mt-6 max-w-xl text-center text-sm text-[#1A1A1A]/60">
        Convaincu ?{" "}
        <Link href="/register?plan=pro" className="font-bold text-[#FF6F00] underline">
          Passer au PRO — 9,99 €/mois
        </Link>{" "}
        ou{" "}
        <Link href="/register" className="font-semibold text-[#075E54] underline">
          commencer gratuitement
        </Link>
        .
      </p>
    </section>
  );
}
