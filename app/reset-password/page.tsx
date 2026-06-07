"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, Lock } from "lucide-react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      setHasRecoverySession(Boolean(data.session));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasRecoverySession(true);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setIsDone(true);
      setTimeout(() => {
        router.push("/post-auth");
        router.refresh();
      }, 1500);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible de mettre a jour le mot de passe pour le moment.",
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
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Nouveau mot de passe</h1>
          <p className="mt-2 text-sm text-[#1A1A1A]/75">
            Choisissez un nouveau mot de passe pour votre compte Wazo Digital.
          </p>

          {isDone ? (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-[#075E54]/20 bg-[#075E54]/5 p-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-[#075E54]" />
              <p className="text-sm font-medium text-[#075E54]">
                Mot de passe mis a jour. Redirection en cours...
              </p>
            </div>
          ) : hasRecoverySession === false ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Lien invalide ou expire. Veuillez relancer une demande depuis la page{" "}
              <Link href="/forgot-password" className="font-semibold underline">
                mot de passe oublie
              </Link>
              .
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleUpdate}>
              <label className="block text-sm font-medium text-[#1A1A1A]">
                Nouveau mot de passe
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-[#075E54]/20 px-3 py-2">
                  <Lock className="h-4 w-4 text-[#075E54]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-[#1A1A1A]/45"
                  />
                </div>
              </label>

              <label className="block text-sm font-medium text-[#1A1A1A]">
                Confirmer le mot de passe
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-[#075E54]/20 px-3 py-2">
                  <Lock className="h-4 w-4 text-[#075E54]" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-[#1A1A1A]/45"
                  />
                </div>
              </label>

              {errorMessage && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {errorMessage}
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
                    Mise a jour...
                  </>
                ) : (
                  "Mettre a jour le mot de passe"
                )}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
