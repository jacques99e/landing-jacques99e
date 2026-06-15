import type { Metadata } from "next";
import Link from "next/link";
import { noIndexMetadata } from "@/lib/seo";
import { BROCHURE, BRAND } from "@/lib/marketing-package";
import { PrintButton } from "./PrintButton";
import "./plaquette.css";

export const metadata: Metadata = noIndexMetadata("Plaquette commerciale Wazo Digital");

export default function PlaquettePage() {
  return (
    <div className="plaquette-root bg-white text-[#1A1A1A]">
      <div className="no-print fixed right-4 top-4 z-50 flex gap-2">
        <PrintButton />
        <a
          href="/marketing"
          className="rounded-lg border border-[#075E54]/30 bg-white px-4 py-2 text-sm font-medium text-[#075E54]"
        >
          Retour
        </a>
      </div>

      {/* Page 1 — Couverture */}
      <section className="plaquette-page cover-page flex flex-col justify-between bg-gradient-to-br from-[#075E54] to-[#0a3d36] p-12 text-white">
        <div>
          <p className="text-sm font-medium opacity-90">Plaquette commerciale 2026</p>
          <h1 className="mt-6 text-4xl font-bold leading-tight">{BROCHURE.cover.headline}</h1>
          <p className="mt-4 text-xl opacity-95">{BROCHURE.cover.subheadline}</p>
        </div>
        <ul className="mt-8 space-y-2 text-sm">
          {BROCHURE.cover.bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span>✓</span>
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-12 border-t border-white/20 pt-6 text-sm">
          <p className="text-2xl font-bold">{BRAND.name}</p>
          <p className="opacity-90">{BRAND.landing}</p>
        </div>
      </section>

      {/* Page 2 — Problème / Solution */}
      <section className="plaquette-page p-10">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-red-700">{BROCHURE.problem.title}</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {BROCHURE.problem.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-red-500">✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#075E54]">{BROCHURE.solution.title}</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {BROCHURE.solution.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-[#075E54]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-10 text-center text-lg font-semibold text-[#FF6F00]">
          {BRAND.tagline} {BRAND.accent}
        </p>
      </section>

      {/* Page 3 — Modules */}
      <section className="plaquette-page p-10">
        <h2 className="text-2xl font-bold text-[#075E54]">6 modules métier — une seule app</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {BROCHURE.modules.map((mod) => (
            <div key={mod.title} className="rounded-xl border border-gray-200 p-4">
              <p className="text-lg font-semibold">
                {mod.emoji} {mod.title}
              </p>
              <p className="text-xs text-gray-600">{mod.tagline}</p>
              <ul className="mt-2 space-y-1 text-xs">
                {mod.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Page 4 — Tarifs */}
      <section className="plaquette-page p-10">
        <h2 className="text-2xl font-bold text-[#075E54]">Tarifs simples</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {BROCHURE.pricing.map((plan) => (
            <div
              key={plan.title}
              className={`rounded-xl border p-5 ${plan.popular ? "border-[#FF6F00] bg-[#FF6F00]/5" : "border-gray-200"}`}
            >
              {plan.popular ? (
                <span className="rounded-full bg-[#FF6F00] px-2 py-0.5 text-[10px] font-bold text-white">
                  Recommandé
                </span>
              ) : null}
              <p className="mt-2 text-lg font-bold">{plan.title}</p>
              <p className="text-2xl font-bold text-[#075E54]">
                {plan.price}
                <span className="text-sm font-normal text-gray-600">{plan.suffix}</span>
              </p>
              <p className="text-xs text-gray-600">{plan.subtitle}</p>
              <ul className="mt-3 space-y-1 text-xs">
                {plan.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Page 5 — Démarrage + Contact */}
      <section className="plaquette-page p-10">
        <h2 className="text-2xl font-bold text-[#075E54]">Comment démarrer</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2">
          {BROCHURE.steps.map((step) => (
            <li key={step.n} className="flex gap-3 rounded-xl bg-[#075E54]/5 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#075E54] text-sm font-bold text-white">
                {step.n}
              </span>
              <div>
                <p className="font-semibold">{step.title}</p>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <h3 className="mt-10 text-lg font-bold">Pourquoi nous faire confiance</h3>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {BROCHURE.trust.map((t) => (
            <li key={t} className="flex gap-2">
              <span>🔒</span>
              {t}
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-2xl bg-[#075E54] p-6 text-white">
          <p className="text-lg font-bold">Contact commercial</p>
          <p className="mt-2 text-sm">{BROCHURE.contact.name}</p>
          <p className="text-sm">📧 {BROCHURE.contact.email}</p>
          <p className="text-sm">📱 WhatsApp {BROCHURE.contact.whatsapp}</p>
          <p className="mt-3 text-sm font-semibold">{BROCHURE.contact.web}</p>
          <p className="mt-4 text-xs opacity-80">
            Inscription gratuite : {BRAND.register}
          </p>
        </div>
      </section>
    </div>
  );
}
