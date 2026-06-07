"use client";

import { FormEvent, useState } from "react";
import { Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

type ProfileFormProps = {
  initialFullName: string;
  email: string;
  phone: string;
};

type Feedback = { type: "success" | "error"; message: string } | null;

export function ProfileForm({ initialFullName, email, phone }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);

  async function handleProfileUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileFeedback(null);
    setIsSavingProfile(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() },
      });

      if (error) {
        setProfileFeedback({ type: "error", message: error.message });
        return;
      }

      setProfileFeedback({ type: "success", message: "Profil mis a jour." });
    } catch (error) {
      setProfileFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Erreur lors de la mise a jour.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordFeedback(null);

    if (password !== confirmPassword) {
      setPasswordFeedback({ type: "error", message: "Les mots de passe ne correspondent pas." });
      return;
    }

    setIsSavingPassword(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setPasswordFeedback({ type: "error", message: error.message });
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setPasswordFeedback({ type: "success", message: "Mot de passe mis a jour." });
    } catch (error) {
      setPasswordFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Erreur lors de la mise a jour.",
      });
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-2xl border border-[#075E54]/10 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1A1A1A]">Informations personnelles</h2>

        <form className="mt-4 space-y-4" onSubmit={handleProfileUpdate}>
          <label className="block text-sm font-medium text-[#1A1A1A]">
            Nom complet
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-[#075E54]/20 px-3 py-2">
              <User className="h-4 w-4 text-[#075E54]" />
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Votre nom"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#1A1A1A]/45"
              />
            </div>
          </label>

          {email && (
            <div className="block text-sm font-medium text-[#1A1A1A]">
              Email
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-[#075E54]/10 bg-[#FFF8F0] px-3 py-2 text-[#1A1A1A]/70">
                <Mail className="h-4 w-4 text-[#075E54]" />
                <span className="text-sm">{email}</span>
              </div>
            </div>
          )}

          {phone && (
            <div className="block text-sm font-medium text-[#1A1A1A]">
              Telephone
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-[#075E54]/10 bg-[#FFF8F0] px-3 py-2 text-[#1A1A1A]/70">
                <Phone className="h-4 w-4 text-[#075E54]" />
                <span className="text-sm">{phone}</span>
              </div>
            </div>
          )}

          {profileFeedback && (
            <p
              className={`rounded-lg border px-3 py-2 text-xs ${
                profileFeedback.type === "success"
                  ? "border-[#075E54]/30 bg-[#075E54]/5 text-[#075E54]"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {profileFeedback.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSavingProfile}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF6F00] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSavingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
            Enregistrer
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-[#075E54]/10 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1A1A1A]">Securite</h2>

        <form className="mt-4 space-y-4" onSubmit={handlePasswordUpdate}>
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

          {passwordFeedback && (
            <p
              className={`rounded-lg border px-3 py-2 text-xs ${
                passwordFeedback.type === "success"
                  ? "border-[#075E54]/30 bg-[#075E54]/5 text-[#075E54]"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {passwordFeedback.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSavingPassword}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#075E54] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSavingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
            Changer le mot de passe
          </button>
        </form>
      </section>
    </div>
  );
}
