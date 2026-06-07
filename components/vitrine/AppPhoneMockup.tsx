"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Package, User, Home, MessageCircle } from "lucide-react";

/** Aperçu visuel de l'application Wazo Digital dans un cadre téléphone. */
export function AppPhoneMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative mx-auto w-full max-w-[280px]"
    >
      <div className="rounded-[2.5rem] border-[6px] border-gray-900 bg-gray-900 p-2 shadow-2xl">
        <div className="overflow-hidden rounded-[2rem] bg-[#F5F5F0]">
          {/* Status bar */}
          <div className="flex items-center justify-between bg-[#075E54] px-4 py-2 text-[10px] text-white">
            <span>9:41</span>
            <span className="font-semibold">Wazo Digital</span>
            <span>●●●</span>
          </div>

          {/* Dashboard content */}
          <div className="space-y-3 p-3 pb-16">
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <p className="text-[10px] text-gray-500">Aujourd&apos;hui</p>
              <p className="text-2xl font-bold text-[#075E54]">125 000 FCFA</p>
              <p className="text-[10px] text-gray-400">12 ventes</p>
            </div>

            <p className="text-[10px] font-medium text-gray-500">Mes modules</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { emoji: "🏪", label: "Commerce", color: "bg-[#075E54]" },
                { emoji: "🌾", label: "Agriculture", color: "bg-emerald-700" },
                { emoji: "🏥", label: "Santé", color: "bg-rose-600" },
                { emoji: "🚚", label: "Logistique", color: "bg-sky-600" },
              ].map((m) => (
                <div
                  key={m.label}
                  className={`flex flex-col items-center gap-1 rounded-xl ${m.color} p-2.5 text-white`}
                >
                  <span className="text-lg">{m.emoji}</span>
                  <span className="text-[9px] font-bold">{m.label}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-2 text-[9px] text-amber-900">
              ⚠️ 3 produits en stock bas
            </div>
          </div>

          {/* Bottom nav */}
          <div className="flex justify-around border-t border-[#075E54]/20 bg-[#075E54] py-2">
            {[
              { icon: Home, label: "Accueil" },
              { icon: Package, label: "Produits" },
              { icon: ShoppingBag, label: "Ventes" },
              { icon: MessageCircle, label: "Messages" },
              { icon: User, label: "Profil" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-0.5 text-white/80">
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                <span className="text-[7px]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="absolute -right-4 top-16 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#075E54] shadow-lg"
      >
        💰 Vente enregistrée
      </motion.div>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
        className="absolute -left-4 bottom-32 rounded-xl bg-[#FF6F00] px-3 py-2 text-xs font-semibold text-white shadow-lg"
      >
        📴 Mode hors ligne OK
      </motion.div>
    </motion.div>
  );
}
