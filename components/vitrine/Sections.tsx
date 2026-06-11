"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ChevronDown, ArrowRight, Star } from "lucide-react";
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
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#075E54]">Avantages clés</p>
        <h2 className="mt-2 text-2xl font-bold md:text-3xl">Pourquoi Wazo Digital ?</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[#1A1A1A]/65">
          Chaque fonctionnalité est pensée pour vous faire gagner du temps — et de l&apos;argent.
        </p>
      </div>
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
              className="group rounded-2xl border border-[#075E54]/10 bg-white p-6 shadow-sm transition hover:border-[#075E54]/25 hover:shadow-md"
            >
              <div className="mb-3 inline-flex rounded-full bg-[#075E54]/10 p-3 transition group-hover:bg-[#075E54]/15">
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
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#FF6F00]">Simple comme 1-2-3</p>
        <h2 className="mt-2 text-2xl font-bold md:text-3xl">Comment ça marche ?</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-[#1A1A1A]/65">
          De l&apos;inscription à votre première vente en moins de 5 minutes.
        </p>
      </div>
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
            {i < STEPS.length - 1 && (
              <span
                className="absolute right-0 top-1/2 hidden h-0.5 w-6 translate-x-full bg-[#075E54]/20 md:block"
                aria-hidden
              />
            )}
            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#FF6F00] text-xl font-bold text-white shadow-lg shadow-[#FF6F00]/20">
              {step.n}
            </span>
            <h3 className="mb-2 font-semibold">{step.title}</h3>
            <p className="text-sm text-[#1A1A1A]/70">{step.desc}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link
          href="/register?plan=pro"
          className="inline-flex items-center gap-2 rounded-full bg-[#075E54] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Je commence maintenant
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-12">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#075E54]">Témoignages</p>
        <h2 className="mt-2 text-2xl font-bold md:text-3xl">Ils utilisent l&apos;app — et s&apos;abonnent</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <motion.blockquote
            key={t.name}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex flex-col rounded-2xl border border-[#075E54]/10 bg-white p-6 shadow-sm"
          >
            <div className="mb-3 flex gap-0.5 text-[#FF6F00]" aria-label="5 étoiles">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="flex-1 text-sm leading-relaxed text-[#1A1A1A]/85">&ldquo;{t.quote}&rdquo;</p>
            <footer className="mt-4 border-t border-[#075E54]/10 pt-4">
              <p className="font-semibold text-[#075E54]">{t.name}</p>
              <p className="text-xs text-[#1A1A1A]/60">{t.role}</p>
              <p className="mt-1 text-xs font-semibold text-[#FF6F00]">{t.result}</p>
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
        <span className="inline-flex rounded-full bg-[#FF6F00]/10 px-4 py-1.5 text-sm font-semibold text-[#FF6F00]">
          Tarifs transparents
        </span>
        <h2 className="mt-4 text-2xl font-bold md:text-4xl">
          Tarifs simples, adaptés à toutes les bourses
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[#1A1A1A]/65">
          Commencez gratuit. Passez au PRO quand votre activité décolle — sans engagement, annulable
          à tout moment.
        </p>
        <Link href="/tarifs" className="mt-3 inline-block text-sm font-medium text-[#075E54] hover:underline">
          Voir la comparaison détaillée →
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-3 md:items-stretch">
        {PRICING.map((plan, i) => (
          <motion.article
            key={plan.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${
              plan.popular
                ? "z-10 scale-[1.02] border-[#075E54] shadow-xl shadow-[#075E54]/15 ring-2 ring-[#075E54]/20 md:-mt-2 md:mb-2"
                : "border-[#075E54]/10"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#FF6F00] px-4 py-1 text-xs font-bold text-white shadow-md">
                ⭐ Recommandé — le plus choisi
              </span>
            )}
            <p className="text-sm font-semibold text-[#075E54]">{plan.title}</p>
            <p className="mt-1 font-medium">{plan.subtitle}</p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold">{plan.price}</span>
              <span className="text-sm text-[#1A1A1A]/50">{plan.priceSuffix}</span>
            </div>
            <p className="mt-1 text-xs font-medium text-[#FF6F00]">{plan.hook}</p>
            <ul className="mt-5 flex-1 space-y-2.5 text-sm text-[#1A1A1A]/80">
              {plan.features.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#075E54]" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={`/register?plan=${plan.id}`}
              className={`mt-6 inline-flex w-full justify-center rounded-full px-5 py-3 text-sm font-bold transition ${
                plan.ctaVariant === "primary"
                  ? "cta-pulse bg-[#FF6F00] text-white shadow-lg shadow-[#FF6F00]/25 hover:brightness-110"
                  : "border-2 border-[#075E54]/30 text-[#075E54] hover:bg-[#075E54]/5"
              }`}
            >
              {plan.cta}
            </Link>
          </motion.article>
        ))}
      </div>
      <p className="mt-8 text-center text-xs text-[#1A1A1A]/50">
        Paiement sécurisé · Facture mensuelle · Upgrade ou downgrade à tout moment
      </p>
    </section>
  );
}

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-32 py-12">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold md:text-3xl">Questions fréquentes</h2>
        <p className="mt-2 text-sm text-[#1A1A1A]/60">Dernières objections avant de vous lancer ?</p>
      </div>
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
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#075E54] via-[#0a7a6e] to-[#075E54] px-6 py-14 text-center text-white md:px-12 md:py-16">
      <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-[#FF6F00]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <p className="relative text-sm font-semibold uppercase tracking-wider text-[#FF6F00]">
        Dernière étape
      </p>
      <h2 className="relative mt-2 text-2xl font-extrabold md:text-4xl">
        Votre activité mérite un vrai outil. Pas un cahier.
      </h2>
      <p className="relative mx-auto mt-4 max-w-xl text-base text-white/90">
        Rejoignez les commerçants qui encaissent, suivent et grandissent avec Wazo Digital. Gratuit
        pour démarrer — PRO à 9,99 € quand vous êtes prêt.
      </p>
      <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/register?plan=pro"
          className="cta-pulse inline-flex items-center gap-2 rounded-full bg-[#FF6F00] px-8 py-4 text-base font-bold text-white shadow-xl shadow-[#FF6F00]/30 transition hover:brightness-110"
        >
          Je m&apos;abonne au PRO
          <ArrowRight className="h-5 w-5" />
        </Link>
        <Link
          href="/register"
          className="rounded-full border-2 border-white/40 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
        >
          Rester sur le gratuit
        </Link>
      </div>
      <p className="relative mt-5 text-sm text-white/70">
        Sans carte bancaire pour le gratuit · Installation en 2 minutes · Support en français
      </p>
    </section>
  );
}
