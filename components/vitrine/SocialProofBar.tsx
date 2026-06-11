"use client";

import { motion } from "framer-motion";
import { SOCIAL_PROOF_ITEMS } from "@/lib/vitrine-data";

export function SocialProofBar() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="border-y border-[#075E54]/10 bg-white/80 py-4 backdrop-blur-sm"
      aria-label="Preuves sociales"
    >
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 text-center text-sm">
        {SOCIAL_PROOF_ITEMS.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-2 text-[#1A1A1A]/75">
            <span className="text-base" aria-hidden>
              {item.emoji}
            </span>
            <span>
              <strong className="font-semibold text-[#075E54]">{item.highlight}</strong>{" "}
              {item.label}
            </span>
          </span>
        ))}
      </div>
    </motion.section>
  );
}
