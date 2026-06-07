"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";
import { getAuthCallbackUrl } from "../../lib/public-urls";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: getAuthCallbackUrl("/reset-password"),
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage(
        "Si un compte existe pour cette adresse, un email avec un lien de reinitialisation vient d'etre envoye.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible d'envoyer l'email pour le moment.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FFF8F0] px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#075E54] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour a la connexion
        </Link>

        <section className="rounded-2xl border border-[#075E54]/10 bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Mot de passe oublie</h1>
          <p className="mt-2 text-sm text-[#1A1A1A]/75">
            Entrez votre email, nous vous enverrons un lien pour reinitialiser votre mot de passe.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleReset}>
            <label className="block text-sm font-medium text-[#1A1A1A]">
              Adresse email
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-[#075E54]/20 px-3 py-2">
                <Mail className="h-4 w-4 text-[#075E54]" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="email@wazo.africa"
                  required
                  autoComplete="email"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[#1A1A1A]/45"
                />
              </div>
            </label>

            {errorMessage && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="rounded-lg border border-[#075E54]/30 bg-[#075E54]/5 px-3 py-2 text-xs text-[#075E54]">
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FF6F00] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                "Envoyer le lien"
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-[#1A1A1A]/75">
            Vous vous souvenez de votre mot de passe ?{" "}
            <Link href="/login" className="font-semibold text-[#075E54] hover:underline">
              Se connecter
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
