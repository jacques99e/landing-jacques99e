"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface MidPageCtaProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function MidPageCta({
  eyebrow,
  title,
  subtitle,
  primaryHref = "/register?plan=pro",
  primaryLabel = "Passer au PRO — 9,99 €/mois",
  secondaryHref = "#modules",
  secondaryLabel = "Découvrir les modules",
}: MidPageCtaProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#075E54] to-[#0a7a6e] px-6 py-10 text-center text-white md:px-12"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#FF6F00]/20 blur-3xl" />
      <p className="text-sm font-semibold uppercase tracking-wider text-[#FF6F00]">{eyebrow}</p>
      <h3 className="relative mt-2 text-xl font-bold md:text-2xl">{title}</h3>
      <p className="relative mx-auto mt-3 max-w-xl text-sm text-white/85 md:text-base">{subtitle}</p>
      <div className="relative mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href={primaryHref}
          className="inline-flex items-center gap-2 rounded-full bg-[#FF6F00] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF6F00]/30 transition hover:brightness-110"
        >
          {primaryLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
        {secondaryHref && (
          <a
            href={secondaryHref}
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {secondaryLabel}
          </a>
        )}
      </div>
    </motion.aside>
  );
}
