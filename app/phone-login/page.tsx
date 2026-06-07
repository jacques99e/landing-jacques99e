"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, KeyRound, Loader2, Phone } from "lucide-react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

export default function PhoneLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function normalizePhone(value: string) {
    const trimmed = value.trim().replace(/\s+/g, "");
    return trimmed;
  }

  async function handleSendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizePhone(phone),
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setStep("code");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Impossible d'envoyer le code.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.verifyOtp({
        phone: normalizePhone(phone),
        token: token.trim(),
        type: "sms",
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.push("/post-auth");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Code invalide ou expire.",
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
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Connexion par SMS</h1>
          <p className="mt-2 text-sm text-[#1A1A1A]/75">
            {step === "phone"
              ? "Entrez votre numero, nous vous enverrons un code par SMS."
              : `Entrez le code recu au ${phone}.`}
          </p>

          {step === "phone" ? (
            <form className="mt-6 space-y-4" onSubmit={handleSendCode}>
              <label className="block text-sm font-medium text-[#1A1A1A]">
                Numero de telephone
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-[#075E54]/20 px-3 py-2">
                  <Phone className="h-4 w-4 text-[#075E54]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+228 90 00 00 00"
                    required
                    autoComplete="tel"
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
                    Envoi...
                  </>
                ) : (
                  "Recevoir le code"
                )}
              </button>
            </form>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleVerifyCode}>
              <label className="block text-sm font-medium text-[#1A1A1A]">
                Code de verification
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-[#075E54]/20 px-3 py-2">
                  <KeyRound className="h-4 w-4 text-[#075E54]" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    placeholder="123456"
                    required
                    autoComplete="one-time-code"
                    className="w-full bg-transparent text-sm tracking-widest outline-none placeholder:text-[#1A1A1A]/45"
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
                    Verification...
                  </>
                ) : (
                  "Verifier et se connecter"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setToken("");
                  setErrorMessage(null);
                }}
                className="w-full text-center text-xs font-medium text-[#075E54] hover:underline"
              >
                Modifier le numero
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
