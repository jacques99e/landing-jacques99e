"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { DEMO_VIDEO } from "@/lib/vitrine-data";

export function DemoVideoSection() {
  return (
    <section id="demo" className="scroll-mt-32 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-2xl font-bold md:text-3xl">Voir l&apos;application en action</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-[#1A1A1A]/70 md:text-base">
          {DEMO_VIDEO.subtitle}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-2xl border border-[#075E54]/15 bg-white shadow-lg shadow-[#075E54]/10"
      >
        <div className="relative aspect-video w-full bg-[#075E54]/5">
          <video
            className="h-full w-full object-cover"
            controls
            playsInline
            preload="metadata"
            {...(DEMO_VIDEO.poster ? { poster: DEMO_VIDEO.poster } : {})}
          >
            <source src={DEMO_VIDEO.mp4Src} type="video/mp4" />
            <source src={DEMO_VIDEO.webmSrc} type="video/webm" />
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-[#075E54]/10 px-4 py-3 text-left text-sm">
          <Play className="h-4 w-4 text-[#075E54]" />
          <span className="font-medium">{DEMO_VIDEO.title}</span>
          <span className="text-xs text-[#1A1A1A]/50">
            — voix Edge FR · {DEMO_VIDEO.durationLabel} · parcours production
          </span>
        </div>
      </motion.div>
    </section>
  );
}
