import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SiteHeader } from "@/components/vitrine/SiteHeader";
import { SiteFooter } from "@/components/vitrine/SiteFooter";
import { WHATSAPP_SUPPORT } from "@/lib/vitrine-data";

export const metadata: Metadata = pageMetadata(
  "Politique de confidentialité",
  "Comment Wazo Digital collecte, utilise et protège vos données.",
  "/confidentialite"
);

export default function ConfidentialitePage() {
  return (
    <div className="scroll-smooth bg-[#FFF8F0] font-[system-ui,sans-serif] text-[#1A1A1A]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-32 md:px-6">
        <h1 className="text-3xl font-bold">Politique de confidentialité</h1>
        <p className="mt-3 text-sm text-[#1A1A1A]/70">Dernière mise à jour : juin 2026</p>
        <div className="prose prose-sm mt-8 max-w-none space-y-6 text-[#1A1A1A]/85">
          <section>
            <h2 className="text-lg font-semibold text-[#075E54]">Données collectées</h2>
            <p>
              Lors de l&apos;inscription et de l&apos;utilisation de Wazo Digital, nous traitons :
              identité (nom, e-mail, téléphone), données de boutique (produits, ventes, clients),
              et données techniques (logs, appareil) pour faire fonctionner le service.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[#075E54]">Finalités</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Création et gestion de votre compte commerçant</li>
              <li>Synchronisation cloud et sauvegarde de vos données métier</li>
              <li>Paiements d&apos;abonnement (via prestataire sécurisé PayDunya)</li>
              <li>Support client et amélioration du produit</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[#075E54]">Conservation & sécurité</h2>
            <p>
              Les données sont stockées sur Supabase avec chiffrement en transit (HTTPS) et contrôle
              d&apos;accès par rôles (RLS). Vous pouvez demander la suppression de votre compte en
              nous contactant.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[#075E54]">Vos droits</h2>
            <p>
              Accès, rectification, suppression, portabilité : contactez-nous sur WhatsApp{" "}
              <a
                href={`https://wa.me/${WHATSAPP_SUPPORT.replace(/\D/g, "")}`}
                className="text-[#075E54] underline"
              >
                {WHATSAPP_SUPPORT}
              </a>
              .
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[#075E54]">Cookies</h2>
            <p>
              Le site utilise des cookies techniques nécessaires à l&apos;authentification et au
              fonctionnement de l&apos;application. Pas de publicité ciblée tierce.
            </p>
          </section>
          <p>
            <Link href="/mentions-legales" className="text-[#075E54] underline">
              Mentions légales
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
