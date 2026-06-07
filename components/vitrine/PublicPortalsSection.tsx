"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { PUBLIC_PORTALS } from "@/lib/vitrine-data";
import { resolveAppUrl } from "@/lib/public-urls";

export function PublicPortalsSection() {
  const appUrl = resolveAppUrl();

  return (
    <section id="portails" className="scroll-mt-32 py-16">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#FF6F00]">
          Portails publics
        </p>
        <h2 className="mt-2 text-2xl font-bold md:text-4xl">Vos clients sans installer l&apos;app</h2>
        <p className="mx-auto mt-3 max-w-2xl text-[#1A1A1A]/70">
          Boutique, formation, suivi colis et vérification traçabilité — liens partageables sur
          WhatsApp.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PUBLIC_PORTALS.map((portal, i) => {
          const href = `${appUrl}${portal.path}`;
          return (
            <motion.a
              key={portal.path}
              href={href}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="group flex items-center justify-between rounded-2xl border border-[#075E54]/15 bg-white p-5 shadow-sm transition hover:border-[#075E54]/40 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{portal.emoji}</span>
                <div>
                  <p className="font-semibold">{portal.title}</p>
                  <p className="text-sm text-[#1A1A1A]/65">{portal.desc}</p>
                  <p className="mt-1 font-mono text-xs text-[#075E54]">{portal.path}</p>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 shrink-0 text-[#075E54] transition group-hover:translate-x-0.5" />
            </motion.a>
          );
        })}
      </div>
    </section>
  );
}
