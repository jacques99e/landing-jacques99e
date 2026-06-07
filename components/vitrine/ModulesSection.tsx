"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { APP_MODULES } from "@/lib/vitrine-data";

export function ModulesSection() {
  return (
    <section id="modules" className="scroll-mt-32 py-16">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#FF6F00]">Modules</p>
        <h2 className="mt-2 text-2xl font-bold md:text-4xl">Tout votre métier, une seule app</h2>
        <p className="mx-auto mt-3 max-w-2xl text-[#1A1A1A]/70">
          Activez uniquement les modules dont vous avez besoin — commerce, agriculture, santé,
          logistique, formation ou traçabilité.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {APP_MODULES.map((mod, i) => {
          const Icon = mod.icon;
          return (
            <motion.article
              key={mod.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="flex flex-col rounded-2xl border border-[#075E54]/10 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className={`rounded-xl ${mod.color} p-2.5 text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold">
                    {mod.emoji} {mod.title}
                  </p>
                  <p className="text-xs text-[#1A1A1A]/60">{mod.tagline}</p>
                </div>
              </div>
              <ul className="mb-5 flex-1 space-y-2 text-sm text-[#1A1A1A]/75">
                {mod.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#075E54]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/register?module=${mod.id}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#075E54] hover:underline"
              >
                Activer ce module
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
