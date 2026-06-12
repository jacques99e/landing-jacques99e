"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Lock, Mail, Phone } from "lucide-react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";
import { GoogleButton } from "../../components/google-button";
import { markPlanForCheckout } from "../../lib/plan-checkout";
import { PRICING } from "../../lib/vitrine-data";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const selectedPlan = searchParams.get("plan");
  const planInfo = PRICING.find((p) => p.id === selectedPlan);

  useEffect(() => {
    const planId = searchParams.get("plan");
    if (planId && ["free", "pro", "business"].includes(planId)) {
      sessionStorage.setItem("wazo_pending_plan", planId);
      markPlanForCheckout(planId);
    }
  }, [searchParams]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.push("/post-auth");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible de se connecter pour le moment.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const registerHref = selectedPlan ? `/register?plan=${selectedPlan}` : "/register";

  return (
    <main className="min-h-screen bg-[#FFF8F0] px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#075E54] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour a l'accueil
        </Link>

        <section className="rounded-2xl border border-[#075E54]/10 bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Connexion</h1>
          <p className="mt-2 text-sm text-[#1A1A1A]/75">
            Accedez a votre espace Wazo Digital en quelques secondes.
          </p>

          {planInfo ? (
            <p className="mt-4 rounded-xl border border-[#FF6F00]/30 bg-[#FF6F00]/10 px-4 py-3 text-sm text-[#FF6F00]">
              Paiement <strong>{planInfo.title}</strong> après connexion — {planInfo.price}
              {planInfo.priceSuffix}
            </p>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
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

            <label className="block text-sm font-medium text-[#1A1A1A]">
              Mot de passe
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-[#075E54]/20 px-3 py-2">
                <Lock className="h-4 w-4 text-[#075E54]" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[#1A1A1A]/45"
                />
              </div>
            </label>

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-[#075E54] hover:underline"
              >
                Mot de passe oublie ?
              </Link>
            </div>

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
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#075E54]/10" />
            <span className="text-xs text-[#1A1A1A]/50">ou</span>
            <span className="h-px flex-1 bg-[#075E54]/10" />
          </div>

          <div className="space-y-3">
            <GoogleButton />
            <Link
              href="/phone-login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#075E54]/20 bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1A1A] transition hover:bg-[#075E54]/5"
            >
              <Phone className="h-4 w-4 text-[#075E54]" />
              Continuer avec un numero de telephone
            </Link>
          </div>

          <p className="mt-4 text-center text-sm text-[#1A1A1A]/75">
            Pas encore de compte ?{" "}
            <Link href={registerHref} className="font-semibold text-[#075E54] hover:underline">
              Creer un compte
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#FFF8F0]">
          <Loader2 className="h-6 w-6 animate-spin text-[#075E54]" />
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
