"use client";

import { motion } from "framer-motion";
import { CheckCircle, CreditCard, Smartphone } from "lucide-react";

const STEPS = [
  { icon: Smartphone, title: "Lien créé", detail: "100 000 FCFA — Commande #42", color: "bg-orange-100 text-orange-800" },
  { icon: CreditCard, title: "Client paie", detail: "Orange Money • MTN • Moov", color: "bg-blue-100 text-blue-800" },
  { icon: CheckCircle, title: "Vente en caisse", detail: "Notif push + e-mail marchand", color: "bg-green-100 text-green-800" },
];

export function MomoFlowDemo() {
  return (
    <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl border border-orange-200 bg-white p-6 shadow-lg">
      <div className="mb-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Démo interactive</p>
        <p className="text-lg font-bold text-[#075E54]">Boutique Wazo Demo</p>
      </div>
      <ol className="space-y-3">
        {STEPS.map((step, i) => (
          <motion.li
            key={step.title}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className={`flex items-center gap-3 rounded-2xl p-3 ${step.color}`}
          >
            <step.icon className="h-8 w-8 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{step.title}</p>
              <p className="text-xs opacity-80">{step.detail}</p>
            </div>
          </motion.li>
        ))}
      </ol>
      <motion.div
        className="mt-4 rounded-xl bg-[#075E54] py-3 text-center text-sm font-bold text-white"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        Payé ✓ — 100 000 FCFA
      </motion.div>
    </div>
  );
}
