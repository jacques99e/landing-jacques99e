"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, X, Check } from "lucide-react";
import { PAIN_GAIN } from "@/lib/vitrine-data";

export function PainGainSection() {
  return (
    <section className="py-16">
      <div className="mb-10 text-center">
        <span className="inline-flex rounded-full bg-[#FF6F00]/10 px-4 py-1.5 text-sm font-semibold text-[#FF6F00]">
          Le déclic
        </span>
        <h2 className="mt-4 text-2xl font-bold md:text-4xl">{PAIN_GAIN.title}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-[#1A1A1A]/70">{PAIN_GAIN.subtitle}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-red-200/80 bg-red-50/50 p-6 md:p-8"
        >
          <p className="mb-4 text-sm font-bold uppercase tracking-wide text-red-700/80">
            {PAIN_GAIN.withoutLabel}
          </p>
          <ul className="space-y-3">
            {PAIN_GAIN.without.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-[#1A1A1A]/80">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border-2 border-[#075E54]/30 bg-gradient-to-br from-[#075E54]/10 to-[#FF6F00]/5 p-6 shadow-lg shadow-[#075E54]/10 md:p-8"
        >
          <p className="mb-4 text-sm font-bold uppercase tracking-wide text-[#075E54]">
            {PAIN_GAIN.withLabel}
          </p>
          <ul className="space-y-3">
            {PAIN_GAIN.with.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-[#1A1A1A]/85">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#075E54]" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/register?plan=pro"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#FF6F00] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-105"
          >
            {PAIN_GAIN.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
