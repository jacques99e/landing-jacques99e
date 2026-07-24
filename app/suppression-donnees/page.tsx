import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SiteHeader } from "@/components/vitrine/SiteHeader";
import { SiteFooter } from "@/components/vitrine/SiteFooter";
import { WHATSAPP_SUPPORT } from "@/lib/vitrine-data";

export const metadata: Metadata = pageMetadata(
  "Suppression des données",
  "Comment demander la suppression de vos données Wazo Digital et Facebook Login.",
  "/suppression-donnees"
);

export default function DataDeletionPage() {
  return (
    <div className="scroll-smooth bg-[#FFF8F0] font-[system-ui,sans-serif] text-[#1A1A1A]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-32 md:px-6">
        <h1 className="text-3xl font-bold">Suppression des données</h1>
        <p className="mt-3 text-sm text-[#1A1A1A]/70">Dernière mise à jour : juillet 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#1A1A1A]/85">
          <section>
            <h2 className="text-lg font-semibold text-[#075E54]">Compte Wazo Digital</h2>
            <p className="mt-2">
              Pour supprimer votre compte commerçant et les données associées (boutique, produits,
              ventes), contactez le support WhatsApp{" "}
              <a
                href={`https://wa.me/${WHATSAPP_SUPPORT.replace(/\D/g, "")}`}
                className="font-semibold text-[#075E54] underline"
              >
                {WHATSAPP_SUPPORT}
              </a>{" "}
              avec l&apos;objet « Suppression de compte ».
            </p>
            <p className="mt-2">
              Nous traitons la demande sous 30 jours et confirmons la suppression par message.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#075E54]">Facebook / Instagram (connexion sociale)</h2>
            <p className="mt-2">
              Si vous avez connecté une Page Facebook via Wazo Digital, vous pouvez :
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Déconnecter la Page dans l&apos;app : Paramètres métier → Réseaux sociaux →
                Déconnecter
              </li>
              <li>
                Ou révoquer l&apos;accès dans Facebook : Paramètres → Applications et sites web →
                Wazo Digital Social → Supprimer
              </li>
              <li>
                Demander la suppression des jetons stockés via WhatsApp{" "}
                <a
                  href={`https://wa.me/${WHATSAPP_SUPPORT.replace(/\D/g, "")}`}
                  className="text-[#075E54] underline"
                >
                  {WHATSAPP_SUPPORT}
                </a>
              </li>
            </ul>
          </section>

          <p>
            <Link href="/confidentialite" className="text-[#075E54] underline">
              Politique de confidentialité
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
