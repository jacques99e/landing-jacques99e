import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? "";

  return (
    <main className="min-h-screen bg-[#FFF8F0] px-4 py-8">
      <div className="mx-auto w-full max-w-xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#075E54] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au tableau de bord
        </Link>

        <h1 className="text-2xl font-bold text-[#1A1A1A] md:text-3xl">Mon profil</h1>
        <p className="mt-2 text-sm text-[#1A1A1A]/75">
          Gerez vos informations personnelles et votre securite.
        </p>

        <ProfileForm
          initialFullName={fullName}
          email={user.email ?? ""}
          phone={user.phone ?? ""}
        />
      </div>
    </main>
  );
}
