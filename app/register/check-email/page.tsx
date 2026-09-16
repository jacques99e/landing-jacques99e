"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { createSupabaseBrowserClient } from "../../../lib/supabase/client";
import { getAuthCallbackUrl } from "../../../lib/public-urls";
import { mailInboxLabel, mailInboxUrl } from "../../../lib/email-confirm";

function CheckEmailForm() {
  const searchParams = useSearchParams();
  const email = (searchParams.get("email") || "").trim();
  const fromLogin = searchParams.get("reason") === "login";
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const inboxHref = useMemo(() => mailInboxUrl(email), [email]);
  const inboxLabel = useMemo(() => mailInboxLabel(email), [email]);

  async function resend() {
    if (!email) {
      setStatus("error");
      setErrorMessage("Indiquez votre email depuis la page d’inscription.");
      return;
    }
    setStatus("sending");
    setErrorMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: getAuthCallbackUrl() },
      });
      if (error) {
        setStatus("error");
        setErrorMessage("Impossible d’envoyer le mail. Réessayez dans une minute.");
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("error");
      setErrorMessage("Impossible d’envoyer le mail. Réessayez dans une minute.");
    }
  }

  return (
    <main className="min-h-screen bg-[#FFF8F0] px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <section className="rounded-2xl border border-[#075E54]/10 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#075E54]/10 text-[#075E54]">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Ouvrez votre email</h1>
          <p className="mt-2 text-sm text-[#1A1A1A]/75">
            {fromLogin
              ? "Votre compte n’est pas encore confirmé. Cliquez le lien reçu, puis revenez vous connecter."
              : "Un lien de confirmation a été envoyé. Sans ce clic, l’essai PRO de 14 jours ne démarre pas."}
          </p>
          {email ? (
            <p className="mt-4 rounded-xl border border-[#075E54]/15 bg-[#075E54]/5 px-4 py-3 text-sm font-medium text-[#075E54]">
              {email}
            </p>
          ) : null}

          <a
            href={inboxHref}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#FF6F00] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-105"
          >
            {inboxLabel}
          </a>

          <button
            type="button"
            onClick={() => void resend()}
            disabled={status === "sending" || !email}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#075E54]/20 bg-white px-5 py-2.5 text-sm font-semibold text-[#075E54] transition hover:bg-[#075E54]/5 disabled:opacity-70"
          >
            {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {status === "sent" ? "Mail renvoyé" : "Renvoyer le lien"}
          </button>

          {status === "sent" ? (
            <p className="mt-3 text-xs text-green-700">
              Nouveau mail envoyé. Vérifiez aussi les spams.
            </p>
          ) : null}
          {errorMessage ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <p className="mt-6 text-center text-sm text-[#1A1A1A]/75">
            Déjà confirmé ?{" "}
            <Link href="/login" className="font-semibold text-[#075E54] hover:underline">
              Se connecter
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#FFF8F0]">
          <Loader2 className="h-6 w-6 animate-spin text-[#075E54]" />
        </main>
      }
    >
      <CheckEmailForm />
    </Suspense>
  );
}
