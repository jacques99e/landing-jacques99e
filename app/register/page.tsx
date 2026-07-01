"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Lock, Mail, User } from "lucide-react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";
import { GoogleButton } from "../../components/google-button";
import { getAuthCallbackUrl } from "../../lib/public-urls";
import { markPlanForCheckout } from "../../lib/plan-checkout";
import { trackMetaCompleteRegistration, trackMetaLead } from "../../lib/meta-pixel";
import { APP_MODULES, PRICING } from "../../lib/vitrine-data";

const VALID_MODULES = [
  "commerce",
  "agriculture",
  "health",
  "logistics",
  "education",
  "blockchain",
] as const;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const selectedModule = searchParams.get("module");
  const moduleInfo = APP_MODULES.find((mod) => mod.id === selectedModule);
  const selectedPlan = searchParams.get("plan");
  const planInfo = PRICING.find((p) => p.id === selectedPlan);

  useEffect(() => {
    const moduleId = searchParams.get("module");
    if (moduleId && VALID_MODULES.includes(moduleId as (typeof VALID_MODULES)[number])) {
      sessionStorage.setItem("wazo_pending_module", moduleId);
    }
    const planId = searchParams.get("plan");
    if (planId && ["free", "pro", "business"].includes(planId)) {
      sessionStorage.setItem("wazo_pending_plan", planId);
      markPlanForCheckout(planId);
    }
    trackMetaLead(searchParams.get("plan") ? `plan_${searchParams.get("plan")}` : "register");
  }, [searchParams]);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: getAuthCallbackUrl(),
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.session) {
        trackMetaCompleteRegistration("email");
        router.push("/post-auth");
        router.refresh();
        return;
      }

      setSuccessMessage(
        "Compte cree. Verifiez votre boite mail pour confirmer votre adresse, puis connectez-vous.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible de creer le compte pour le moment.",
      );
    } finally {
      setIsLoading(false);
    }
  }

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
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Creer un compte</h1>
          <p className="mt-2 text-sm text-[#1A1A1A]/75">
            Lancez votre activite digitale avec Wazo Digital en 2 minutes.
          </p>

          {planInfo ? (
            <p className="mt-4 rounded-xl border border-[#FF6F00]/30 bg-[#FF6F00]/10 px-4 py-3 text-sm text-[#FF6F00]">
              Plan choisi : <strong>{planInfo.title}</strong> — {planInfo.price}
              {planInfo.priceSuffix}
              <span className="mt-1 block text-xs text-[#1A1A1A]/65">{planInfo.subtitle}</span>
            </p>
          ) : null}

          {moduleInfo ? (
            <p className="mt-4 rounded-xl border border-[#075E54]/20 bg-[#075E54]/5 px-4 py-3 text-sm text-[#075E54]">
              Module pré-sélectionné : <strong>{moduleInfo.emoji} {moduleInfo.title}</strong>
              <span className="mt-1 block text-xs text-[#1A1A1A]/65">{moduleInfo.tagline}</span>
            </p>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={handleRegister}>
            <label className="block text-sm font-medium text-[#1A1A1A]">
              Nom complet
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-[#075E54]/20 px-3 py-2">
                <User className="h-4 w-4 text-[#075E54]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Fatou Diop"
                  required
                  autoComplete="name"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[#1A1A1A]/45"
                />
              </div>
            </label>

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
                  Creation...
                </>
              ) : (
                "Creer mon compte gratuit"
              )}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#075E54]/10" />
            <span className="text-xs text-[#1A1A1A]/50">ou</span>
            <span className="h-px flex-1 bg-[#075E54]/10" />
          </div>

          <GoogleButton label="S'inscrire avec Google" />

          <p className="mt-4 text-center text-sm text-[#1A1A1A]/75">
            Deja un compte ?{" "}
            <Link href="/login" className="font-semibold text-[#075E54] hover:underline">
              Se connecter
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#FFF8F0]">
          <Loader2 className="h-6 w-6 animate-spin text-[#075E54]" />
        </main>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
