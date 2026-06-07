"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  APP_FEATURES,
  FAQS,
  PRICING,
  STEPS,
  TESTIMONIALS,
  TRUST_SIGNALS,
} from "@/lib/vitrine-data";

export function FeaturesSection() {
  return (
    <section className="py-12">
      <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">Pourquoi Wazo Digital ?</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {APP_FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-[#075E54]/10 bg-white p-6 shadow-sm"
            >
              <div className="mb-3 inline-flex rounded-full bg-[#075E54]/10 p-3">
                <Icon className="h-6 w-6 text-[#075E54]" />
              </div>
              <h3 className="mb-2 font-semibold">{f.title}</h3>
              <p className="text-sm text-[#1A1A1A]/70">{f.desc}</p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

export function TrustSection() {
  return (
    <section id="confiance" className="scroll-mt-32 py-12">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#075E54]">Confiance</p>
        <h2 className="mt-2 text-2xl font-bold md:text-3xl">Vos données, protégées</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-[#1A1A1A]/70">
          Wazo Digital est conçu pour les commerçants africains : simplicité d&apos;usage et
          sécurité sans jargon technique.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {TRUST_SIGNALS.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-[#075E54]/15 bg-[#075E54]/5 p-6"
            >
              <div className="mb-3 inline-flex rounded-full bg-white p-3 shadow-sm">
                <Icon className="h-6 w-6 text-[#075E54]" />
              </div>
              <h3 className="mb-2 font-semibold">{item.title}</h3>
              <p className="text-sm text-[#1A1A1A]/75">{item.desc}</p>
            </motion.article>
          );
        })}
      </div>
      <p className="mt-6 text-center text-xs text-[#1A1A1A]/50">
        Hébergement sécurisé • Paiements Mobile Money via prestataires certifiés • Équipe avec rôles
        (plan Business)
      </p>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section className="py-16">
      <h2 className="mb-10 text-center text-2xl font-bold md:text-3xl">Comment ça marche ?</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.n}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="relative rounded-2xl border border-[#075E54]/10 bg-white p-6 text-center shadow-sm"
          >
            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#FF6F00] text-xl font-bold text-white">
              {step.n}
            </span>
            <h3 className="mb-2 font-semibold">{step.title}</h3>
            <p className="text-sm text-[#1A1A1A]/70">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-12">
      <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">Ils utilisent l&apos;app</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <motion.blockquote
            key={t.name}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-[#075E54]/10 bg-white p-6 shadow-sm"
          >
            <p className="text-sm leading-relaxed text-[#1A1A1A]/85">&ldquo;{t.quote}&rdquo;</p>
            <footer className="mt-4">
              <p className="font-semibold text-[#075E54]">{t.name}</p>
              <p className="text-xs text-[#1A1A1A]/60">{t.role}</p>
            </footer>
          </motion.blockquote>
        ))}
      </div>
    </section>
  );
}

export function PricingSection() {
  return (
    <section id="tarifs" className="scroll-mt-32 py-16">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold md:text-3xl">Tarifs simples, adaptés à toutes les bourses</h2>
        <Link href="/tarifs" className="mt-2 inline-block text-sm font-medium text-[#075E54] hover:underline">
          Voir la comparaison détaillée →
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {PRICING.map((plan, i) => (
          <motion.article
            key={plan.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className={`relative rounded-2xl border bg-white p-6 shadow-sm ${
              plan.popular ? "border-[#075E54] shadow-lg shadow-[#075E54]/10" : "border-[#075E54]/10"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#075E54] px-3 py-1 text-xs font-semibold text-white">
                Populaire
              </span>
            )}
            <p className="text-sm font-semibold text-[#075E54]">{plan.title}</p>
            <p className="mt-1 font-medium">{plan.subtitle}</p>
            <p className="mt-3 text-3xl font-bold">{plan.price}</p>
            <ul className="mt-5 space-y-2 text-sm text-[#1A1A1A]/80">
              {plan.features.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-[#075E54]" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={plan.id ? `/register?plan=${plan.id}` : "/register"}
              className="mt-6 inline-flex w-full justify-center rounded-full bg-[#FF6F00] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Commencer
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-32 py-12">
      <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">Questions fréquentes</h2>
      <div className="mx-auto max-w-3xl space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = open === idx;
          return (
            <div key={faq.q} className="overflow-hidden rounded-2xl border border-[#075E54]/10 bg-white">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : idx)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-medium">{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-[#075E54] transition ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <p className="border-t border-[#075E54]/5 px-5 pb-5 pt-3 text-sm text-[#1A1A1A]/75">
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="rounded-3xl bg-[#075E54] px-6 py-12 text-center text-white md:px-12">
      <h2 className="text-2xl font-bold md:text-4xl">Prêt à utiliser l&apos;application ?</h2>
      <p className="mx-auto mt-3 max-w-xl text-white/85">
        Inscription gratuite sur ce site — puis ouverture automatique de Wazo Digital pour gérer
        votre activité.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/register"
          className="rounded-full bg-[#FF6F00] px-6 py-3 text-sm font-semibold text-white"
        >
          Créer mon compte
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
        >
          J&apos;ai déjà un compte
        </Link>
      </div>
      <p className="mt-4 text-sm text-white/70">Sans carte bancaire • Installation en 2 minutes</p>
    </section>
  );
}
