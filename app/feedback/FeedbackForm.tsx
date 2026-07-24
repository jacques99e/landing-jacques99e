"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/vitrine/SiteHeader";
import { SiteFooter } from "@/components/vitrine/SiteFooter";
import { WHATSAPP_SUPPORT } from "@/lib/vitrine-data";

const WA = `https://wa.me/${WHATSAPP_SUPPORT.replace(/\D/g, "")}`;

export function FeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [store, setStore] = useState("");
  const [rating, setRating] = useState(4);
  const [worksWell, setWorksWell] = useState("");
  const [improve, setImprove] = useState("");
  const [missingFeature, setMissingFeature] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          store,
          rating,
          worksWell,
          improve,
          missingFeature,
          source: "feedback-page",
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setError(data.error || "Envoi impossible.");
        return;
      }
      setDone(true);
    } catch {
      setError("Erreur réseau. Réessayez ou écrivez sur WhatsApp.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-[#075E54]/20 bg-white p-6 text-center shadow-sm">
        <p className="text-xl font-bold text-[#075E54]">Merci !</p>
        <p className="mt-2 text-sm text-[#1A1A1A]/75">
          Votre avis nous aide à améliorer Wazo Digital pour les commerçants.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="https://app.wazo-digital.com"
            className="rounded-xl bg-[#075E54] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Retour à l&apos;app
          </Link>
          <a
            href={WA}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-[#075E54]/30 px-4 py-2.5 text-sm font-semibold text-[#075E54]"
          >
            WhatsApp support
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-[#075E54]/15 bg-white p-5 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Prénom / nom</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
            placeholder="Ex. Armel"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
            placeholder="vous@email.com"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Boutique (optionnel)</span>
        <input
          value={store}
          onChange={(e) => setStore(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
          placeholder="Nom de votre boutique"
        />
      </label>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Note globale (1 = faible, 5 = excellent)</legend>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`h-10 w-10 rounded-full text-sm font-bold ${
                rating === n
                  ? "bg-[#F4A261] text-white"
                  : "border border-gray-200 bg-white text-gray-700"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Ce qui marche bien</span>
        <textarea
          value={worksWell}
          onChange={(e) => setWorksWell(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
          placeholder="Ex. Caisse rapide, reçu WhatsApp…"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Ce qu&apos;il faut améliorer</span>
        <textarea
          value={improve}
          onChange={(e) => setImprove(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
          placeholder="Ex. Trop lent, bouton peu clair…"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Fonctionnalité manquante</span>
        <textarea
          value={missingFeature}
          onChange={(e) => setMissingFeature(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5"
          placeholder="Ex. Impression ticket, multi-caissiers…"
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-xl bg-[#075E54] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {sending ? "Envoi…" : "Envoyer mon avis"}
      </button>

      <p className="text-center text-xs text-[#1A1A1A]/55">
        Ou répondez directement sur{" "}
        <a href={WA} className="font-semibold text-[#075E54] underline" target="_blank" rel="noreferrer">
          WhatsApp {WHATSAPP_SUPPORT}
        </a>
      </p>
    </form>
  );
}

export default function FeedbackPageClient() {
  return (
    <div className="scroll-smooth bg-[#FFF8F0] font-[system-ui,sans-serif] text-[#1A1A1A]">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 pb-20 pt-32 md:px-6">
        <h1 className="text-3xl font-bold">Votre avis compte</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#1A1A1A]/75">
          Vous utilisez Wazo Digital en pilote. Dites-nous ce qui aide vraiment votre activité —
          et ce qui freine encore. Vos retours guident les prochaines améliorations.
        </p>
        <div className="mt-8">
          <FeedbackForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
