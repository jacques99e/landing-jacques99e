"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LEGAL_PAGES } from "@/lib/legal-content";

const STORAGE_KEY = "wazo_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const save = (value: "accepted" | "essential") => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentement cookies"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-[#075E54]/15 bg-white/95 p-4 shadow-lg backdrop-blur-sm md:p-5"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-[#1A1A1A]/80">
          Nous utilisons des cookies essentiels pour la connexion et, avec votre accord, des cookies de
          mesure. Consultez notre{" "}
          <Link href="/legal/cookies" className="font-medium text-[#075E54] underline">
            politique cookies
          </Link>
          .
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => save("essential")}
            className="rounded-lg border border-[#075E54]/25 px-4 py-2 text-sm font-medium text-[#075E54]"
          >
            Essentiels uniquement
          </button>
          <button
            type="button"
            onClick={() => save("accepted")}
            className="rounded-lg bg-[#075E54] px-4 py-2 text-sm font-semibold text-white"
          >
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
}

/** Liens légaux compacts pour pied de page formulaire */
export function LegalFormLinks() {
  return (
    <p className="text-xs text-[#1A1A1A]/60">
      En créant un compte, vous acceptez nos{" "}
      <Link href="/legal/cgu" className="text-[#075E54] underline">
        CGU
      </Link>{" "}
      et notre{" "}
      <Link href="/legal/confidentialite" className="text-[#075E54] underline">
        politique de confidentialité
      </Link>
      .
    </p>
  );
}

export { LEGAL_PAGES };
